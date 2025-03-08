import type { UserResponseDto as UserType } from '@packages/common';

declare global {
  namespace Express {
    interface User extends UserType {} // User 타입 확장
  }
}
