// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Role } from '..';

// export const ROLE_METADATA = 'USE_ROLE'; // Role 메타데이터 키
// export const ROLE_ACCESS_METADATA = 'USE_ACCESS'; // 권한 설정 메타데이터 키

// @Injectable()
// export class RoleGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRole = this.reflector.get<Role>(ROLE_METADATA, context.getHandler());
//     const allowedPermissions = this.reflector.get<Role[]>(ROLE_ACCESS_METADATA, context.getHandler());

//     // ✅ 요청 정보 가져오기
//     const request = context.switchToHttp().getRequest();
//     const user = request.user; // `JwtAuthGuard`가 실행된 후 `req.user`가 존재

//     if (!user) {
//       throw new ForbiddenException('로그인이 필요합니다.');
//     }

//     // ✅ 사용자의 역할 가져오기
//     const userRoles: Role[] = user.role ?? [];

//     // ✅ 관리자(ADMIN)은 모든 API 접근 가능
//     if (userRoles.includes(Role.ADMIN)) {
//       return true;
//     }

//     // ✅ 특정 역할이 필요하지 않은 경우: 모든 사용자 허용
//     if (!requiredRole) {
//       return true;
//     }

//     // ✅ 사용자가 필요한 역할을 가지고 있는지 확인
//     if (userRoles.includes(requiredRole)) {
//       return true;
//     }

//     // ✅ 사용자가 허용된 권한 목록에 포함되는지 확인
//     if (allowedPermissions && allowedPermissions.some((role) => userRoles.includes(role))) {
//       return true;
//     }

//     throw new ForbiddenException('권한이 없습니다.');
//   }
// }
