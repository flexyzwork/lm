import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DRIZZLE, User, schema } from '@packages/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { jest } from '@jest/globals';
import { mock } from 'jest-mock-extended';
import { eq } from 'drizzle-orm';

const { users } = schema;

describe('UsersService', () => {
  let service: UsersService;
  let database: jest.Mocked<NodePgDatabase<typeof schema>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DRIZZLE, useValue: mock<NodePgDatabase<typeof schema>>() }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    database = module.get(DRIZZLE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ `getOneByEmail()` 테스트
  it('should return a user by email', async () => {
    const mockUser: User = {
      id: '1',
      provider: 'email' as const,
      providerId: null,
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'student',
      name: 'Test User',
      picture: null,
      createdAt: new Date(),
    };

    database.query = {
      users: {
        findFirst: jest.fn().mockImplementation(async () => mockUser as User | null),
      },
    } as any;

    const result = await service.getOneByEmail(mockUser.email ?? 'fallback@example.com');

    expect(result).toEqual(mockUser);
    expect(database.query.users.findFirst).toHaveBeenCalledWith({
      where: eq(users.email, mockUser.email ?? 'fallback@example.com'),
    });
  });

  it('should return null by email', async () => {
    database.query = {
      users: {
        findFirst: jest.fn().mockImplementation(async () => null),
      },
    } as any;

    const result = await service.getOneByEmail('nonexistent@example.com');

    expect(result).toBeNull();
    expect(database.query.users.findFirst).toHaveBeenCalledWith({
      where: eq(users.email, 'nonexistent@example.com'),
    });
  });
});
