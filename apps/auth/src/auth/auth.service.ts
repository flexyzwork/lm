import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { schema, DRIZZLE, User, getEnv } from '@packages/common';
import type { CreateUserDto } from '@packages/common';

const { users } = schema;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>,
    @InjectRedis() private readonly redis: Redis,
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  /** 🔹 OAuth 로그인 처리 (Google, GitHub) */
  async validateOAuthLogin(userData: CreateUserDto) {
    if (!userData.provider || !userData.providerId) throw new UnauthorizedException('Invalid user data');

    // ✅ provider 유효성 검사 먼저 수행
    if (!['google', 'github'].includes(userData.provider)) {
      throw new UnauthorizedException('Unsupported provider');
    }

    const userArray = await this.db
      .select()
      .from(users)
      .where(and(eq(users.provider, userData.provider), eq(users.providerId, userData.providerId!)))
      .limit(1);

    const user = userArray.length > 0 ? userArray[0] : null;

    if (!user) {
      const user = await this.usersService.create(userData);

      if (!user) throw new UnauthorizedException('Failed to create user');
      const tokens = await this.generateTokens(user);
      return { tokens, user };
    }
    const tokens = await this.generateTokens(user);
    return { tokens, user };
  }

  /** 🔹 이메일 회원가입 */
  async register(userData: CreateUserDto) {
    const { email, password } = userData;
    if (!email || !password) throw new UnauthorizedException('Email and password are required');

    const existingUser = await this.usersService.getOneByEmail(email);
    if (existingUser) throw new UnauthorizedException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      provider: 'email',
      email: userData.email,
      password: hashedPassword,
    });

    if (!user) throw new UnauthorizedException('Failed to create user');

    const tokens = await this.generateTokens(user);
    return { tokens, user };
  }

  /** 🔹 이메일 로그인 */
  async login(email: string, password: string) {
    if (!email || !password) throw new UnauthorizedException('Email and password are required');

    const user = await this.usersService.getOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.generateTokens(user);
    return { tokens, user };
  }

  /** 🔹 로그아웃 (Refresh Token 삭제) */
  async logout(id: string) {
    const deleted = await this.redis.del(`refreshToken:${id}`);
    if (deleted === 0) {
      console.log('📌 [DEBUG] Refresh token not found');
    }
    return true;
  }

  /** 🔹 로그아웃 시 쿠키 삭제 구문 리턴 */
  getCookieForLogOut() {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0`,
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
    ];
  }

  /** 🔹 JWT & Refresh Token 발급 */
  private async generateTokens(user: Omit<User, 'password'>) {
    const payload = {
      id: user.id,
      provider: user.provider,
      providerId: user.providerId,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: getEnv(this.configService, 'JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: getEnv(this.configService, 'REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }
    );

    // 🔹 Refresh Token을 Redis에 저장 (7일)
    await this.redis.set(`refreshToken:${user.id}`, refreshToken, 'EX', 604800);

    return { accessToken, refreshToken };
  }

  /** 🔹 Refresh Token 갱신 */
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: getEnv(this.configService, 'REFRESH_TOKEN_SECRET'),
      });

      const storedToken = await this.redis.get(`refreshToken:${decoded.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token expired or invalid');
      }

      const user = await this.usersService.getOne(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const tokens = await this.generateTokens(user);
      return { tokens, user };
    } catch {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }
}
