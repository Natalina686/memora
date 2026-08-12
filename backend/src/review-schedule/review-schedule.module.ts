import { Module } from '@nestjs/common';
import { ReviewScheduleController } from './review-schedule.controller';
import { ReviewScheduleService } from './review-schedule.service';

@Module({
  controllers: [ReviewScheduleController],
  providers: [ReviewScheduleService]
})
export class ReviewScheduleModule {}
