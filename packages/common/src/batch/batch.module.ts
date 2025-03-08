import { Module, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BatchController } from './batch.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [Logger],
  controllers: [BatchController],
})
export class BatchModule {}
