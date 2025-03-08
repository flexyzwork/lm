import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import express from 'express';
import { User } from '../schemas';

@Injectable()
export class OwnershipGuard<T> implements CanActivate {
  constructor(
    private readonly resourceService: { getOne: (id: string) => Promise<T | null> },
    private readonly ownerKey: keyof T, // 소유자를 나타내는 필드명 (예: "userId")
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<express.Request>();
    const user = request.user as User; // 현재 요청한 사용자
    const resourceId = request.params.id; // 요청된 리소스 ID

    if (!user) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    // ✅ 동적으로 엔티티 가져오기
    const resource = await this.resourceService.getOne(resourceId);

    if (!resource) {
      throw new ForbiddenException('해당 리소스를 찾을 수 없습니다.');
    }

    // ✅ 소유자 검증 (동적으로 설정한 `ownerKey` 필드와 비교)
    if (resource[this.ownerKey] !== user.id) {
      throw new ForbiddenException('해당 리소스를 수정하거나 삭제할 권한이 없습니다.');
    }

    return true;
  }
}