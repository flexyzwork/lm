import {
  ArgumentsHost,
  HttpException,
  Catch,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { logger } from '../../../logger.config'; // winston 로거 import


@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
    const httpAdapterHost = this.httpAdapterHost;
    if (!httpAdapterHost) {
      return;
    }
    const { httpAdapter } = httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      url: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception instanceof Error ? exception.message : exception,
      stack: exception instanceof Error ? exception.stack : null,
    };

    logger.warn(
      `Exception: ${responseBody.url} \n  Stack: ${responseBody.stack}`,
    );
  }
}
