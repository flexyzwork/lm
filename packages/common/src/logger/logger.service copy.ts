import { Injectable, ConsoleLogger, LogLevel } from '@nestjs/common';

@Injectable()
export class Logger extends ConsoleLogger {
  constructor() {
    super(); // ✅ 변경: ConsoleLogger 사용
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    super.verbose(message, ...optionalParams);
  }

  fatal(message: any, context?: string, ...optionalParams: any[]) {
    console.error(`[FATAL] ${message}`, ...optionalParams); // 별도 fatal 로그 처리
  }
}