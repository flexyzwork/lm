import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE, schema } from '@packages/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Redis } from 'ioredis';
import { UnauthorizedException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let redis: jest.Mocked<Redis>;
  let db: jest.Mocked<NodePgDatabase<typeof schema>>;

  /** 🔹 테스트에서 공통으로 사용할 데이터 */
  const mockUserData = {
    provider: 'google',
    providerId: '123',
    email: 'test@example.com',
  };

  const mockUser = {
    id: '1',
    createdAt: null,
    email: mockUserData.email,
    provider: mockUserData.provider as 'email' | 'google' | 'github',
    providerId: mockUserData.providerId,
    password: 'hashedPassword',
    role: 'student' as 'student' | 'teacher',
    name: 'Test User',
    picture: null,
  };

  const expectedTokens = {
    accessToken: 'test_access_token',
    refreshToken: 'test_refresh_token',
  };

  /** ✅ Drizzle ORM Select Mock */
  const mockDatabaseSelect = (mockData: any[]) => {
    db.select.mockImplementation(
      () =>
        ({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockImplementation(async () => mockData ?? []), // null 방지
            }),
          }),
        }) as any
    );
  };

  /** ✅ Drizzle ORM Insert Mock */
  const mockDatabaseInsert = (mockData: any) => {
    db.insert.mockImplementation(
      () =>
        ({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue({
              execute: jest.fn().mockImplementation(async () => [mockData]),
            }),
          }),
        }) as any
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mock<JwtService>() },
        { provide: UsersService, useValue: mock<UsersService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
        { provide: DRIZZLE, useValue: mock<NodePgDatabase<typeof schema>>() },
        { provide: Redis, useValue: mock<Redis>() },
        { provide: 'default_IORedisModuleConnectionToken', useValue: mock<Redis>() },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    redis = module.get(Redis);
    db = module.get(DRIZZLE);

    // ✅ 공통 Mock 설정
    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test_secret';
      if (key === 'REFRESH_TOKEN_SECRET') return 'test_refresh_secret';
      return null;
    });
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPassword');
    jest.spyOn(bcrypt, 'compare').mockImplementation(async (pass, hash) => pass === hash);

    jest.spyOn(redis, 'del').mockImplementationOnce(async (key) => (key.includes('1') ? 1 : 0));

    jest.spyOn(usersService, 'create').mockImplementation(async (userData: any) => {
      return { ...mockUser, ...userData };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ OAuth 로그인 */
  describe('OAuth Login', () => {
    it('should validate OAuth login for existing user', async () => {
      mockDatabaseSelect([mockUser]);
      jwtService.sign.mockReturnValue(expectedTokens.accessToken);

      const result = await authService.validateOAuthLogin(mockUserData as any);

      expect(result.user).toEqual(mockUser);
      expect((await result.tokens).accessToken).toBe(expectedTokens.accessToken);
    });

    it('should create a new user for OAuth login', async () => {
      mockDatabaseSelect([]);
      mockDatabaseInsert(mockUser);
      jwtService.sign.mockReturnValue(expectedTokens.accessToken);

      const result = await authService.validateOAuthLogin(mockUserData as any);

      expect(result.user).toEqual(mockUser);
      expect((await result.tokens).accessToken).toBe(expectedTokens.accessToken);
    });

    it('should throw an error if provider is not supported', async () => {
      await expect(
        authService.validateOAuthLogin({
          ...mockUserData,
          provider: 'invalidProvider' as any,
        })
      ).rejects.toThrow(UnauthorizedException);
    }); 
  });

  /** ✅ 이메일 회원가입 */
  describe('Register', () => {
    it('should register a new user', async () => {
      usersService.getOneByEmail.mockResolvedValueOnce(null);
      usersService.create.mockResolvedValueOnce(mockUser);
      jwtService.sign.mockReturnValue(expectedTokens.accessToken);

      const result = await authService.register({
        provider: 'email',
        email: mockUserData.email,
        password: 'password123',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.tokens.accessToken).toBe(expectedTokens.accessToken);
    });

    it('should throw error if email already exists', async () => {
      usersService.getOneByEmail.mockResolvedValueOnce(mockUser);

      await expect(
        authService.register({
          provider: 'email',
          email: mockUserData.email,
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  /** ✅ 이메일 로그인 */
  describe('Login', () => {
    it('should login a user', async () => {
      usersService.getOneByEmail.mockResolvedValueOnce(mockUser);
      jwtService.sign.mockReturnValue(expectedTokens.accessToken);

      const result = await authService.login(mockUser.email, 'hashedPassword');

      expect(result.user).toEqual(mockUser);
      expect(result.tokens.accessToken).toBe(expectedTokens.accessToken);
    });

    it('should throw error if email is incorrect', async () => {
      usersService.getOneByEmail.mockResolvedValueOnce(null);

      await expect(authService.login('wrong@example.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });
  });

  /** ✅ 로그아웃 */
  describe('Logout', () => {
    it('should logout a user and delete refresh token from Redis', async () => {
      jest.spyOn(redis, 'del').mockResolvedValue(1); // 정상 삭제됨

      const result = await authService.logout('1');
      expect(result).toBeTruthy();
    });

    it('should handle logout when refresh token does not exist in Redis', async () => {
      jest.spyOn(redis, 'del').mockResolvedValue(0); // 삭제할 데이터 없음

      const result = await authService.logout('1');
      expect(result).toBeTruthy(); // 그래도 로그아웃이 성공해야 함
    });
  });

  /** 🔹 로그아웃 시 쿠키 삭제 구문 리턴 */
  describe('The AuthService', () => {
    describe('when calling the getCookieForLogOut method', () => {
      it('should return a correct string', () => {
        const result = authService.getCookieForLogOut();
        expect(result).toEqual([
          expect.stringContaining('Authentication=; HttpOnly; Path=/; Max-Age=0'),
          expect.stringContaining('refreshToken=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict'),
        ]);
      });
    });
  });
});
