import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '@packages/common';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
