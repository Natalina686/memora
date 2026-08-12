import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewScheduleService } from './review-schedule.service';

@Controller('review-schedule')
export class ReviewScheduleController {
  constructor(private readonly reviewScheduleService: ReviewScheduleService) {}

  @Get()
  findAll() {
    return this.reviewScheduleService.findAll();
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('knowledgeId') knowledgeId: string,
    @Body('nextReviewAt') nextReviewAt: string,
  ) {
    return this.reviewScheduleService.create(
      learnerId,
      knowledgeId,
      new Date(nextReviewAt),
    );
  }
}
