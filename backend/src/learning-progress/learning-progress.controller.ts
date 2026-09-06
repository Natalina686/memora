import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { LearningProgressService } from './learning-progress.service';

@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
export class LearningProgressController {
  constructor(
    private readonly learningProgressService: LearningProgressService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.learningProgressService.findAll(request.user!.accountId);
  }

  @Post()
  create(
    @Body('learnerId')
    learnerId: string,

    @Body('knowledgeId')
    knowledgeId: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.learningProgressService.create(
      learnerId,
      knowledgeId,
      request.user!.accountId,
    );
  }
}
