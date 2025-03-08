import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class Logger implements LoggerService {
  constructor() {}
  log(message: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
    // throw new Error('Method not implemented.');
  }
  error(message: any, ...optionalParams: any[]) {
    // throw new Error('Method not implemented.');
    console.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
    // throw new Error('Method not implemented.');
  }
  debug?(message: any, ...optionalParams: any[]) {
    console.debug(message, ...optionalParams);
    // throw new Error('Method not implemented.');
  }
  verbose?(message: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
    // throw new Error('Method not implemented.');
  }
  fatal?(message: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
    // throw new Error('Method not implemented.');
  }
  setLogLevels?(levels: LogLevel[]) {
    console.log(levels);
    // throw new Error('Method not implemented.');
  }
}
