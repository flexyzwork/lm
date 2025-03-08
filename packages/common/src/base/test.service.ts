import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE, schema } from '..';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseService } from './base.service';

const { users } = schema;

@Injectable()
export class TestService extends BaseService<typeof users> {
  constructor(@Inject(DRIZZLE) database: NodePgDatabase<typeof schema>) {
    super(database, users);
  }
}
