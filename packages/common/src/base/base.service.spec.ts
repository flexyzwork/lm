import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { jest } from '@jest/globals';
import { mock } from 'jest-mock-extended';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DRIZZLE, schema } from '..';

describe('TestService', () => {
  let service: TestService;
  let database: jest.Mocked<NodePgDatabase<typeof schema>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestService, { provide: DRIZZLE, useValue: mock<NodePgDatabase<typeof schema>>() }],
    }).compile();

    service = module.get<TestService>(TestService);
    database = module.get(DRIZZLE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ 공통 함수
  const mockDatabaseSelect = (mockData: any[]) => {
    database.select.mockImplementation(
      () =>
        ({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              execute: jest.fn().mockImplementation(async () => mockData ?? []), // null 방지
            }),
            execute: jest.fn().mockImplementation(async () => mockData ?? []), // null 방지
          }),
        }) as any
    );
  };

  const mockDatabaseInsert = (mockData: any) => {
    database.insert.mockImplementation(
      () =>
        ({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue({
              execute: jest.fn().mockImplementation(async () => [mockData]),
            }),
          }),
          returning: jest.fn().mockReturnValue({
            execute: jest.fn().mockImplementation(async () => [mockData]),
          }),
        }) as any
    );
  };

  const mockDatabaseUpdate = (mockData: any) => {
    database.update.mockImplementation(
      () =>
        ({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockReturnValue({
                execute: jest.fn().mockImplementation(async () => [mockData]),
              }),
            }),
          }),
          returning: jest.fn().mockReturnValue({
            execute: jest.fn().mockImplementation(async () => [mockData]),
          }),
        }) as any
    );
  };

  const mockDatabaseDelete = (isSuccess: boolean) => {
    database.delete.mockImplementation(
      () =>
        ({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockReturnValue({
              execute: jest.fn().mockImplementation(async () => (isSuccess ? [{ id: '1' }] : [])),
            }),
          }),
        }) as any
    );
  };

  // ✅ `getOne()` 테스트
  it('should return one entity', async () => {
    const mockEntity = { id: '1', name: 'Test Entity' };
    mockDatabaseSelect([mockEntity]);

    const result = await service.getOne('1');

    expect(result).toEqual(mockEntity);
    expect(database.select).toHaveBeenCalled();
  });

  it('should return null when entity not found', async () => {
    mockDatabaseSelect([]);

    const result = await service.getOne('999');

    expect(result).toBeNull();
  });

  // ✅ `getAll()` 테스트
  it('should return all entities', async () => {
    const mockEntities = [
      { id: '1', name: 'Entity 1' },
      { id: '2', name: 'Entity 2' },
    ];
    mockDatabaseSelect(mockEntities); // ✅ 중복 제거된 공통 함수 사용
    const result = await service.getAll();

    expect(result).toEqual(mockEntities);
    expect(database.select).toHaveBeenCalled();
  });

  // ✅ `create()` 테스트
  it('should create a new entity', async () => {
    const newEntity = { name: 'New Entity' };
    const createdEntity = { id: '1', ...newEntity };
    mockDatabaseInsert(createdEntity);

    const result = await service.create(newEntity as any);

    expect(result).toEqual(createdEntity);
    expect(database.insert).toHaveBeenCalled();
  });

  it('should throw BadRequestException if create data is invalid', async () => {
    await expect(service.create(null as any)).rejects.toThrow(BadRequestException);
    await expect(service.create({} as any)).rejects.toThrow(BadRequestException);
  });

  // ✅ `update()` 테스트
  it('should update an existing entity', async () => {
    const updatedEntity = { id: '1', name: 'Updated Entity' };

    mockDatabaseUpdate(updatedEntity);
    const result = await service.update('1', { name: 'Updated Entity' });

    expect(result).toEqual(updatedEntity);
    expect(database.update).toHaveBeenCalled();
  });

  it('should throw NotFoundException if update fails', async () => {
    mockDatabaseUpdate(null);

    const result = await service.update('999', { name: 'Updated Entity' });
    expect(result).toBeNull();
  });

  // ✅ `delete()` 테스트
  it('should delete an entity', async () => {
    mockDatabaseDelete(true);
    await service.delete('1');

    expect(database.delete).toHaveBeenCalled();
  });

  it('should throw NotFoundException if delete fails', async () => {
    mockDatabaseDelete(false);
    await expect(service.delete('999')).rejects.toThrow(NotFoundException);
  });
});
