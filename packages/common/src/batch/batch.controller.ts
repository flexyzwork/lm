import { Controller, Param, Post } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

@Controller('batches')
export class BatchController {
  constructor(private scheduler: SchedulerRegistry) {}

  @Post('start/:name')
  startJob(@Param('name') name: string) {
    const job = this.scheduler.getCronJob(name);
    job.start();
    console.log('start!! ', job.lastDate());
  }

  @Post('stop/:name')
  stopJob(@Param('name') name: string) {
    const job = this.scheduler.getCronJob(name);
    job.stop();
    console.log('stopped!! ', job.lastDate());
  }
}
