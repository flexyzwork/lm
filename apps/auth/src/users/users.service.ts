import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { BaseService, DRIZZLE, schema, User } from '@packages/common';

const { users } = schema;

@Injectable()
export class UsersService extends BaseService<typeof users> {
  constructor(@Inject(DRIZZLE) database: NodePgDatabase<typeof schema>) {
    super(database, users);
  }

  // ✅ 이메일 기준 사용자 조회
  async getOneByEmail(email: string): Promise<User | null | undefined> {
    return await this.database.query.users.findFirst({ where: eq(users.email, email) });
  }
}
