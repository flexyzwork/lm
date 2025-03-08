import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BaseController, CreateUserDto, UpdateUserDto, User } from '@packages/common';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let baseController: jest.Mocked<BaseController>;

  beforeEach(async () => {
    baseController = {
      applyAPIDecorators: jest.fn(), // ✅ BaseController의 메서드 Mocking
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            getOne: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: BaseController,
          useValue: baseController,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ BaseController가 상속되었는지 확인 */
  it('should inherit from BaseController', () => {
    expect(controller).toBeInstanceOf(UsersController);
    expect(controller).toBeInstanceOf(BaseController);
  });

  /** ✅ POST /users (사용자 생성) */
  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { provider: 'email', email: 'test@example.com', password: '123456' };
      const mockUser = { id: '1', ...createUserDto } as User;

      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  /** ✅ GET /users/:id (특정 사용자 조회) */
  describe('getUser', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      usersService.getOne.mockResolvedValue(mockUser);

      const result = await controller.getUser('1');
      expect(result).toEqual(mockUser);
      expect(usersService.getOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user is not found', async () => {
      usersService.getOne.mockResolvedValue(null);
      const result = await controller.getUser('1');
      expect(result).toBeNull();
    });
  });

  /** ✅ GET /users (전체 사용자 조회) */
  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' } as User];
      usersService.getAll.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();
      expect(result).toEqual(mockUsers);
      expect(usersService.getAll).toHaveBeenCalled();
    });

    it('should return an empty array if no users found', async () => {
      usersService.getAll.mockResolvedValue([]);

      const result = await controller.getUsers();
      expect(result).toEqual([]);
    });
  });

  /** ✅ PATCH /users/:id (사용자 정보 업데이트) */
  describe('update', () => {
    it('should update and return the user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const mockUser = { id: '1', email: 'test@example.com', name: 'Updated Name' } as User;

      usersService.update.mockResolvedValue(mockUser);

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(mockUser);
      expect(usersService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      usersService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('1', { name: 'Updated Name' })).rejects.toThrow(NotFoundException);
    });
  });

  /** ✅ DELETE /users/:id (사용자 삭제) */
  describe('deleteUser', () => {
    it('should delete a user', async () => {
      usersService.delete.mockResolvedValue(undefined);

      await expect(controller.deleteUser('1')).resolves.toBeUndefined();
      expect(usersService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      usersService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteUser('1')).rejects.toThrow(NotFoundException);
    });
  });

  /** ✅ BaseController의 데코레이터 자동 적용 여부 확인 */
  it('should call applyAPIDecorators on initialization', () => {
    const spy = jest.spyOn(BaseController.prototype as any, 'applyAPIDecorators');
    
    // ✅ UsersController 인스턴스 생성 시 BaseController의 생성자 실행
    new UsersController(usersService);  

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
