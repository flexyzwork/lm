import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import { GithubStrategy, GoogleStrategy } from '@packages/common';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRESIN'),
        },
      }),
    }),
    UsersModule,
    // CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, UsersService, ConfigService, GoogleStrategy, GithubStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
