import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authConfig } from './config/authConfig';
import { BatchModule } from './batch/batch.module';
import { FileModule } from './file/file.module';
import { EnhancerModule } from './enhancer/enhancer.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { DatabaseModule } from './database/database.module';
import { AuthCommonModule } from './auth/auth-common.module';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig],
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    EnhancerModule,
    DatabaseModule,
    AuthCommonModule,
    BatchModule,
    FileModule,
    LoggerModule
  ],
})
export class CommonModule {}
