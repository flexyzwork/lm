import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import express from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

// AccessService 클래스와 LogCreateDTO를 포함
class LogCreateDTO {
  url?: string;
  method!: string;
  agent?: string;
  ip?: string;
  requestBody: any;
  deviceId!: string;
  httpStatus!: string;
  responseTime!: string;
  responseBody: any;
  takenSeconds!: number;
  etc?: string;
  userId?: string;
}


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor() { }
  
  createLog(logDTO: LogCreateDTO) {
    // 실제 로그를 생성하는 로직 (예: DB에 저장)
    console.log('Log saved:', logDTO);
  }

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest()
    const res = context.switchToHttp().getResponse()

    // 요청 정보 로깅
    this.logRequestInfo(req);

    const logDTO = this.prepareLogDTO(req);

    // 요청 본문 로깅
    if (Object.keys(req.body).length !== 0) {
      console.log(`BODY\t${JSON.stringify(req.body, null, '\t')}`);
    }

    return next.handle().pipe(
      catchError((error) => {
        const responseTime = this.calculateResponseTime(now);
        logDTO.httpStatus = `${error.status}`;
        logDTO.responseTime = responseTime;
        logDTO.responseBody = error ? JSON.parse(JSON.stringify(error)) : null;
        logDTO.takenSeconds = this.calculateTimeDifference(now);

        // 오류 로깅
        this.createLog(logDTO);
        return throwError(() => error);
      }),
      tap(() => {
        const responseTime = this.calculateResponseTime(now);
        logDTO.httpStatus = '200';
        logDTO.responseTime = responseTime;
        logDTO.etc = `${res.body?.getReader?.length}`;
        logDTO.responseBody = res.body;
        logDTO.takenSeconds = this.calculateTimeDifference(now);

        // 성공적인 응답 처리 및 로깅
        this.createLog(logDTO);
      }),
    );
  }

  private logRequestInfo(req: Request) {
    // console.log(`IP\t${req.ip}`);
    console.log(`AGENT\t${(req.headers as any)['user-agent'] || 'UNKNOWN'}`);
    console.log(`METHOD\t${req.method}`);
    // console.log(`URL\t${req.originalUrl}`);
    // console.log(`DEVICE-ID\t${req.header['device-id']?.toString() || ''}`);
  }

  private prepareLogDTO(req: Request): LogCreateDTO {
    const logDTO = new LogCreateDTO();
    // logDTO.url = req.originalUrl;
    logDTO.method = req.method;
    // logDTO.agent = req.headers['user-agent'] || 'UNKNOWN';
    // logDTO.ip = req.ip;
    logDTO.requestBody = req.body;
    // logDTO.deviceId = req.headers['device-id']?.toString();
    return logDTO;
  }

  private calculateResponseTime(startTime: number): string {
    const gap = Date.now() - startTime;
    const mil = gap % 1000;
    const sec = Math.floor(gap / 1000) % 60;
    const min = Math.floor(gap / (1000 * 60)) % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${mil.toString().padStart(3, '0')}`;
  }

  private calculateTimeDifference(startTime: number): number {
    return Math.floor((Date.now() - startTime) / 1000); // 초 단위로 반환
  }
}
