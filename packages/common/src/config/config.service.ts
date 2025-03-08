import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import * as dotenv from 'dotenv';

@Injectable()
export class ConfigService {
  private readonly envConfig: { [key: string]: string };
  constructor() {
    const result = dotenv.config({
      path: path + '/.env',
    });
    this.envConfig = result.parsed || {};
  }

  get(key: string): string {
    return this.envConfig[key];
  }
  get isDev(): boolean {
    return (process.env.NODE_ENV || 'development') === 'development';
  }
}
