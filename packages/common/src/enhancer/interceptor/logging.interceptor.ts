import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from '../../../logger.config';
import safeStringify from 'fast-safe-stringify';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, url } = req;

    // let responseBody: any = null;

    // ✅ Express의 `res.json()` 메서드 오버라이드하여 응답 본문 저장
    // const originalJson = res.json.bind(res);
    // res.json = (body: any) => {
    //   responseBody = body; // 응답 본문 저장
    //   return originalJson(body);
    // };

    // 🚀 JSON 변환 중 오류 방지 + 민감한 정보 마스킹
    const maskSensitiveData = (data: any, depth = 0, maxDepth = 3): any => {
      if (depth > maxDepth || typeof data !== 'object' || data === null) return data;

      const masked: { [key: string]: any } = Array.isArray(data) ? [] : {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (['password', 'token', 'refreshToken', 'accessToken'].includes(key)) {
            masked[key] = '*****'; // 🚀 민감한 데이터 마스킹
          } else {
            masked[key] = maskSensitiveData(data[key], depth + 1, maxDepth); // 🚀 3단계까지만 탐색
          }
        }
      }
      return masked;
    };

    const prettyJsonStringify = (data: any) => {
      try {
        return data !== undefined
          ? safeStringify(maskSensitiveData(data), undefined, 2) // ✅ JSON을 2칸 들여쓰기하여 프리티 출력
          : '[UNDEFINED]';
      } catch (error) {
        return '[CIRCULAR STRUCTURE]';
      }
    };

    logger.info(`📌 Request to ${method} ${url} \n📤 Request Body: \n${prettyJsonStringify(req.body)}`);

    return next.handle().pipe(
      tap(
        (data) => {
          // const responseDate = responseBody ?? data; 
          const responseDate = data;
          logger.info(`✅ Response from ${method} ${url} \n📥 Response Data: \n${prettyJsonStringify(responseDate)}`);
        },
        (error) => {
          logger.error(`❌ Error in ${method} ${url} \n🚨 Error: \n${prettyJsonStringify(error)}`);
        }
      )
    );
  }
}
