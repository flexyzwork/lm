/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import express from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<express.Response>();
    const request = ctx.getRequest<express.Request>();

    // 기본 상태 코드 가져오기
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // 예외 응답 데이터 가져오기
    const exceptionResponse = exception.getResponse();
    let errorMessage: string | string[] | { message: string; errors: any[] } = 'Unexpected error occurred';

    // ✅ NestJS ValidationPipe 또는 Zod에서 발생한 오류를 명확하게 처리
    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && 'message' in responseBody) {
        errorMessage = (responseBody as any).message;
      } else {
        errorMessage = 'Validation failed';
      }

      // ✅ ZodError 지원 추가
      if (typeof responseBody === 'object' && 'errors' in responseBody) {
        errorMessage = {
          message: 'Validation failed',
          errors: (responseBody as any).errors, // ✅ NestJS에서 전달한 errors 배열 반환
        };
      }
    } else if (exception instanceof HttpException) {
      // 일반 HTTP 예외 메시지 처리
      errorMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'Something went wrong';
    }

    // 오류 로그 남기기
    this.logger.error(`HTTP ${status} Error: ${JSON.stringify(exceptionResponse)}`);

    // ✅ 스웨거에 명확한 오류 반환
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage, // ✅ 상세한 오류 메시지 포함
    });
  }
}
