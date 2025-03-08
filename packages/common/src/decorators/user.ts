import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, cxt: ExecutionContext) => {
    const request = cxt.switchToHttp().getRequest();
    return request.user;
  },
);

export const UserData = createParamDecorator<string>(
  (data: string, cxt: ExecutionContext) => {
    const request = cxt.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
