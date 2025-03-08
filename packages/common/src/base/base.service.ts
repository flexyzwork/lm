import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, TableConfig } from 'drizzle-orm';
import { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { schema } from '..';

/**
 * ✅ Drizzle ORM 기반 공통 CRUD 서비스
 * @template TableType Drizzle 테이블 타입
 */
@Injectable()
export abstract class BaseService<
  TableType extends PgTable<TableConfig>,
  SelectType = TableType['$inferSelect'],
  InsertType = TableType['$inferInsert'],
> {
  constructor(
    protected readonly database: NodePgDatabase<typeof schema>,
    protected readonly table: TableType
  ) {}

  getIdColumn(isUserId?: boolean): PgColumn<any> {
    let id: PgColumn<any>;
    const columns = Reflect.get(this.table, Symbol.for('drizzle:Columns')) as Record<string, PgColumn<any>>;
    if (isUserId) {
      if (!columns?.userId) throw new Error(`테이블 ${this.table as any}에 'userId' 컬럼이 없습니다.`);
      else id = columns.userId;
    } else {
      if (!columns?.id) throw new Error(`테이블 ${this.table as any}에 'id' 컬럼이 없습니다.`);
      else id = columns.id;
    }
    return id;
  }

  private prepareUpdateData(updates: Partial<InsertType>): Record<string, any> {
    const columns = Reflect.get(this.table, Symbol.for('drizzle:Columns')) as Record<string, PgColumn<any>>;
    const updateData: Record<string, any> = {};
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(updates, key) && columns[key]) {
        updateData[key] = updates[key];
      }
    }
    return updateData;
  }

  // ✅ 단일 조회
  async getOne(id: string): Promise<SelectType | null> {
    const idColumn = this.getIdColumn();

    const result = await this.database
      .select()
      .from(this.table as any)
      .where(eq(idColumn, id))
      .execute();

    return result.length > 0 ? (result[0] as SelectType) : null;
  }

  // ✅ 전체 조회
  async getAll(): Promise<SelectType[]> {
    const result = await this.database
      .select()
      .from(this.table as any)
      .execute();
    return Array.isArray(result) ? (result as SelectType[]) : [];
  }

  // ✅ 생성
  async create(data: InsertType): Promise<SelectType> {
    if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length === 0) {
      throw new BadRequestException('유효한 데이터를 제공해야 합니다.');
    }
    const insertData = data as TableType['$inferInsert'];
    const result = await this.database.insert(this.table).values(insertData).returning().execute();
    if (!Array.isArray(result) || result.length === 0) {
      throw new BadRequestException('생성 실패');
    }
    return result[0] as SelectType;
  }

  // ✅ 업데이트
  async update(id: string, updates: Partial<InsertType>): Promise<SelectType> {
    const idColumn = this.getIdColumn();
    const updatesData = this.prepareUpdateData(updates);
    const result = await this.database
      .update(this.table)
      .set(updatesData)
      .where(eq(idColumn, id))
      .returning()
      .execute();
    if (!Array.isArray(result) || result.length === 0) {
      throw new NotFoundException(`업데이트 실패: ID ${id} 없음`);
    }
    return result[0] as SelectType;
  }

  // ✅ 삭제
  async delete(id: string): Promise<void> {
    const idColumn = this.getIdColumn();
    const result = await this.database.delete(this.table).where(eq(idColumn, id)).returning().execute();
    if (!Array.isArray(result) || result.length === 0) {
      throw new NotFoundException(`삭제 실패: ID ${id} 없음`);
    }
  }

  // /**
  //  * ✅ 사용자가 특정 리소스의 소유자인지 확인
  //  * @param userId 사용자 ID
  //  * @param resourceId 리소스 ID
  //  * @returns boolean (소유자 여부)
  //  */
  // async isOwner(userId: string, resourceId: string): Promise<boolean> {
  //   const idColumn = this.getIdColumn();
  //   const ownerColumn = this.getIdColumn(true);

  //   if (!idColumn || !ownerColumn) {
  //     throw new BadRequestException(`테이블에 'id' 또는 'ownerId' 컬럼이 없습니다.`);
  //   }

  //   if (!resourceId) {
  //     throw new BadRequestException(`유효하지 않은 resourceId: ${resourceId}`);
  //   }

  //   try {
  //     const resource = await this.database
  //       .select({ userId: ownerColumn })
  //       .from(this.table as any)
  //       .where(eq(idColumn, resourceId))
  //       .limit(1)
  //       .execute();

  //     return resource.length > 0 ? resource[0].userId === userId : false;
  //   } catch (error) {
  //     console.error('❌ [isOwner] SQL 실행 중 오류 발생:', error);
  //     throw new BadRequestException('소유자 확인 중 오류 발생');
  //   }
  // }
}
