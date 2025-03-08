import { Controller, Post, Body, Res, Req, UnauthorizedException, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { zodToOpenAPI } from 'nestjs-zod';
import express from 'express'; // for esm
import { BaseController, getEnv, Logger, User, UserInfo, userSchemas } from '@packages/common';
import type { CreateUserDto } from '@packages/common';
import { API } from '@packages/common';

const authResponseSchema = {
  type: 'object',
  properties: {
    token: { type: 'string', example: 'access-token' },
    user: zodToOpenAPI(userSchemas.Select),
  },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController extends BaseController {
  private readonly logger = new Logger();
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super();
  }

  /** 📌 RefreshToken을 쿠키에 설정 */
  public setRefreshToken(res: express.Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // 개발 환경에서는 false (운영에서는 true)
      sameSite: 'lax', // 크로스 사이트 요청 허용
    });
  }

  /** 📌 소셜 로그인 시 공통 응답 처리 */
  private async sendSocialAuthResponse(
    res: express.Response,
    tokens: { accessToken: string; refreshToken: string },
    user: User
  ) {
    this.setRefreshToken(res, tokens.refreshToken);
    const userString = encodeURIComponent(JSON.stringify(user));
    const redirectUrl = `${getEnv(this.configService, 'FRONTEND_URL')}/callback?token=${tokens.accessToken}&user=${userString}`;
    return res.redirect(redirectUrl);
  }

  /** 📌 유저가 없으면 예외 발생 */
  private validateUserExistence(user: Express.User | undefined) {
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }
  }

  /** 📌 Google / GitHub 로그인 페이지 이동 */
  @Get(['google'])
  @API({
    authRequired: ['google'],
    autoComplete: false,
  })
  async googleAuthLoginRoute() {
    return { message: 'Social Auth - google' };
  }

  @Get(['github'])
  @API({
    authRequired: ['github'],
    autoComplete: false,
  })
  async githubAuthLoginRoute() {
    return { message: 'Social Auth - github' };
  }

  /** 📌 Google / GitHub 로그인 콜백 */
  @Get(['google/callback'])
  @API({
    authRequired: ['google'],
    autoComplete: false,
  })
  async googleAuthLoginCallback(@Req() req: { user: Express.User }, @Res() res: express.Response) {
    const { tokens, user } = await this.authService.validateOAuthLogin(req.user);
    return this.sendSocialAuthResponse(res, tokens, user);
  }

  @Get(['github/callback'])
  @API({
    authRequired: ['github'],
    autoComplete: false,
  })
  async githubAuthLoginCallback(@Req() req: { user: Express.User }, @Res() res: express.Response) {
    const { tokens, user } = await this.authService.validateOAuthLogin(req.user);
    return this.sendSocialAuthResponse(res, tokens, user);
  }

  /** 📌 회원가입 */
  @Post('register')
  @API({
    authRequired: false,
  })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: express.Response // passthrough 옵션 사용
  ) {
    const { tokens, user } = await this.authService.register(createUserDto);
    this.setRefreshToken(res, tokens.refreshToken); // 리프레시 토큰 설정
    return { token: tokens.accessToken, user };
  }

  /** 📌 로그인 */
  @Post('login')
  @API({
    authRequired: false,
    requestBody: zodToOpenAPI(userSchemas.Login),
    responseSchema: authResponseSchema,
  })
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: express.Response // passthrough 옵션 사용
  ) {
    const { tokens, user } = await this.authService.login(body.email, body.password);
    this.setRefreshToken(res, tokens.refreshToken); // 리프레시 토큰 설정
    return { token: tokens.accessToken, user }; //  JSON 반환 (자동 처리)
  }

  /** 📌 로그아웃 */
  @Post('logout')
  @API({ authRequired: ['jwt'] })
  async logout(
    @UserInfo() user: Express.User,
    @Res({ passthrough: true }) res: express.Response // passthrough 옵션 사용
  ) {
    await this.authService.logout(user?.id);
    res.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return { message: 'Logged out successfully' };
  }

  /** 📌 토큰 갱신 */
  @Post('refresh')
  @API({
    authRequired: false,
    requestBody: null,
    responseSchema: authResponseSchema,
  })
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response // ✅ passthrough 옵션 사용
  ) {
    this.logger.log('refreshToken', req.cookies.refreshToken);
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const { tokens, user } = await this.authService.refreshTokens(refreshToken);
    this.setRefreshToken(res, tokens.refreshToken); // 리프레시 토큰 설정
    return { token: tokens.accessToken, user };
  }

  /** 📌 현재 로그인한 사용자 프로필 조회 + 토큰 반환 */
  @Get('profile')
  @API({
    authRequired: ['jwt'],
    requestBody: null,
    responseSchema: authResponseSchema,
  })
  async getProfile(@UserInfo() user: Express.User, @Req() req: express.Request) {
    this.validateUserExistence(user);
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    return { token, user };
  }

  @Get('health')
  @API({
    authRequired: false,
    requestBody: null,
    responseSchema: null,
  })
  async checkHealth() {
    this.logger.log('checkHealth');
    return { message: 'OK' };
  }
}
