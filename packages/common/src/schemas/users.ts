import 'zod-openapi/extend';
import { z } from 'zod';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// ✅ 역할 Enum
export const roleEnum = pgEnum('user_role', ['USER', 'INSTRUCTOR']);
export const providerEnum = pgEnum('auth_provider', ['EMAIL', 'GOOGLE', 'GITHUB']);

// ✅ Drizzle ORM 유저 테이블
export const users = pgTable('User', {
  userId: uuid('userId').defaultRandom().primaryKey(),
  provider: providerEnum('provider').notNull(),
  providerId: text('providerId'),
  email: text('email'),
  password: text('password'),
  role: roleEnum('role').notNull().default('USER'),
  name: text('name'),
  picture: text('picture'),
  updatedAt: timestamp('updatedAt').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ✅ Zod 스키마 자동 생성 (중복 제거)
export const userSchemas = {
  Select: createSelectSchema(users).openapi({ title: 'UserResponse' }),
  Insert: createInsertSchema(users).omit({ userId: true, createdAt: true }).openapi({ title: 'CreateUser' }),
  Update: createInsertSchema(users)
    .omit({ userId: true, createdAt: true, provider: true, providerId: true, email: true })
    .partial()
    .openapi({ title: 'UpdateUser' }),
  Login: z
    .object({
      provider: z.enum(['EMAIL', 'GOOGLE', 'GITHUB']).openapi({ example: 'EMAIL' }),
      email: z.string().email().openapi({ example: 'user@example.com' }),
      password: z.string().min(6).max(32).trim().openapi({ example: 'password123' }),
    })
    .openapi({ title: 'LoginUser' }),
};
export const authSchemas = userSchemas;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ✅ API 요청/응답 타입 (Drizzle ORM + Zod 활용)
export type LoginUserDto = z.infer<typeof userSchemas.Login>;
export type CreateUserDto = z.infer<typeof userSchemas.Insert>;
export type UpdateUserDto = z.infer<typeof userSchemas.Update>;
export type UserResponseDto = z.infer<typeof userSchemas.Select>;
