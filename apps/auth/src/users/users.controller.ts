import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { BaseController, API } from '@packages/common';
import type { CreateUserDto, UpdateUserDto } from '@packages/common';

@ApiTags('Users')
@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }
  // ✅ 사용자 생성 (POST)
  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  // ✅ 특정 사용자 조회 (GET)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getOne(id);
  }

  // ✅ 전체 사용자 조회 (GET)
  @Get()
  async getUsers() {
    return this.usersService.getAll();
  }

  // ✅ 사용자 정보 업데이트 (Patch)
  @Patch(':id')
  @API({
    authRequired: ['jwt'],
    // role: Role.OWNER,
  })
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  // ✅ 사용자 삭제 (DELETE)
  @Delete(':id')
  @API({
    authRequired: ['jwt'],
    // role: Role.ADMIN,
  })
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
