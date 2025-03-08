import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles';
import { Role } from '../enums/role.enum';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // 역할 제한이 없는 경우 접근 허용
    }

    const { user } = context.switchToHttp().getRequest();

    // ✅ 사용자의 역할이 Enum 중 하나라면 직접 비교
    return requiredRoles.includes(user.role);
  }
}