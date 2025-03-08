import { pgTable, uuid, text, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { courses } from './courses';

// ✅ 결제 제공자 ENUM (현재 stripe만 지원)
export const paymentProviderEnum = pgEnum('payment_provider', ['stripe']);

// ✅ 트랜잭션 (Transactions) 테이블
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(), // ✅ 기존 transactionId → id로 변경
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(), // ✅ FK 적용
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(), // ✅ FK 적용
  paymentProvider: paymentProviderEnum('payment_provider').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // ✅ 정밀도 10, 소수점 2자리
  createdAt: timestamp('created_at').defaultNow().notNull(), // ✅ 기존 dateTime → created_at
});

// ✅ 타입 정의
export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;
