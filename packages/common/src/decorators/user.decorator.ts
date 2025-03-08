import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * ✅ 요청에서 `user` 객체를 가져오는 데코레이터
 */
export const User = createParamDecorator((data: keyof Express.User | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.user) {
    return null; // 인증되지 않은 요청일 경우 `null` 반환
  }

  // ✅ 특정 필드만 가져오도록 설정 가능 (`data`가 있으면 해당 필드만 반환)
  return data ? request.user[data] : request.user;
});
