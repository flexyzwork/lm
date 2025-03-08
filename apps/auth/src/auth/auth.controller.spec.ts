import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { User, CreateUserDto } from '@packages/common';
import { UnauthorizedException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import express from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mock<AuthService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    configService = module.get(ConfigService);
    configService.get.mockImplementation((key: string) => {
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse = (): Partial<express.Response> => ({
    cookie: jest.fn(),
    json: jest.fn(),
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(), // HTTP 상태 코드 설정을 위한 mock
    redirect: jest.fn(), // 응답 본문 설정을 위한 mock
  });

  /** ✅ 회원가입 테스트 */
  describe('register', () => {
    it('should register a new user and set refresh token in cookie', async () => {
      const createUserDto: CreateUserDto = { provider: 'email', email: 'test@example.com', password: '123456' };
      const mockUser: User = { id: '1', ...createUserDto } as User;
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      authService.register.mockResolvedValue({ tokens: mockTokens, user: mockUser });

      const res = mockResponse() as express.Response;

      await controller.register(createUserDto, res);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        })
      );
    });
  });

  /** ✅ 로그인 테스트 */
  describe('login', () => {
    it('should login a user and set refresh token in cookie', async () => {
      const credentials = { email: 'test@example.com', password: '123456' };
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        provider: 'email',
        password: 'hashedPassword',
      } as User;
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      authService.login.mockResolvedValue({ tokens: mockTokens, user: mockUser });

      const res = mockResponse() as express.Response;

      await controller.login(credentials, res);

      expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        })
      );
    });
  });

  /** ✅ 로그아웃 테스트 */
  describe('logout', () => {
    it('should logout the user and clear cookies', async () => {
      authService.logout.mockResolvedValue(true);

      const res = mockResponse() as express.Response;
      await controller.logout({ id: '1' } as any, res);

      expect(authService.logout).toHaveBeenCalledWith('1');
      expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.not.stringContaining('refreshToken'));
    });
  });

  /** ✅ 토큰 갱신 테스트 */
  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const mockTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
      const mockUser: User = { id: '1', email: 'test@example.com', provider: 'email' } as User;

      authService.refreshTokens.mockResolvedValue({ tokens: mockTokens, user: mockUser });

      const mockRequest = { cookies: { refreshToken: 'valid-refresh-token' } } as any;
      const res = mockResponse() as express.Response;

      await controller.refresh(mockRequest, res);

      expect(authService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw UnauthorizedException if refresh token is missing', async () => {
      const mockRequest = { cookies: {} } as any;
      const res = mockResponse() as express.Response;

      await expect(controller.refresh(mockRequest, res)).rejects.toThrow(UnauthorizedException);
    });
  });

  /** ✅ 현재 로그인한 사용자 프로필 조회 */
  describe('getProfile', () => {
    it('should return the logged-in user profile', async () => {
      const mockUser = { id: '1', email: 'test@example.com', provider: 'email' } as any;
      const mockRequest = { headers: { authorization: 'Bearer access-token' } } as any;
      const result = await controller.getProfile(mockUser, mockRequest);

      expect(result).toEqual({
        token: 'access-token',
        user: mockUser,
      });
    });
  });

  /** ✅ `setRefreshToken` 테스트 */
  describe('setRefreshToken', () => {
    it('should set refresh token in cookie', () => {
      const res = mockResponse() as express.Response;
      const refreshToken = 'test-refresh-token';

      controller.setRefreshToken(res, refreshToken);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        })
      );
    });
  });

  /** ✅ 소셜 로그인 콜백 테스트 */
  describe('social login callbacks', () => {
    it('should handle Google login callback', async () => {
      const mockUser: User = { id: '1', email: 'test@example.com', provider: 'google' } as User;
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

      authService.validateOAuthLogin.mockResolvedValue({ tokens: mockTokens, user: mockUser });

      const mockRequest = { user: mockUser } as any;
      const res = mockResponse() as express.Response;

      await controller.googleAuthLoginCallback(mockRequest, res);

      expect(res.redirect).toHaveBeenCalledWith(expect.any(String));
    });
  });
});
