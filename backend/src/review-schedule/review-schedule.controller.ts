import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { ReviewScheduleService } from './review-schedule.service';

@Controller('review-schedule')
@UseGuards(JwtAuthGuard)
export class ReviewScheduleController {
  constructor(private readonly reviewScheduleService: ReviewScheduleService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.reviewScheduleService.findAll(request.user!.accountId);
  }

  @Get('due')
  findDueReviews(@Req() request: AuthenticatedRequest) {
    return this.reviewScheduleService.findDueReviews(request.user!.accountId);
  }

  @Get('due/:learnerId')
  findDueReviewsForLearner(
    @Param('learnerId') learnerId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewScheduleService.findDueReviewsForLearner(
      learnerId,
      request.user!.accountId,
    );
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('knowledgeId') knowledgeId: string,
    @Body('nextReviewAt') nextReviewAt: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewScheduleService.create(
      learnerId,
      knowledgeId,
      new Date(nextReviewAt),
      request.user!.accountId,
    );
  }
}
