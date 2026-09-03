import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { Prisma, QuestionType } from '../../generated/prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.questionsService.findAll(request.user!.accountId);
  }

  @Post()
  create(
    @Body('knowledgeId') knowledgeId: string,
    @Body('type') type: QuestionType,
    @Body('prompt') prompt: string,
    @Body('correctAnswer') correctAnswer: Prisma.InputJsonValue,
    @Body('options') options: Prisma.InputJsonValue | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.questionsService.create(
      knowledgeId,
      request.user!.accountId,
      type,
      prompt,
      correctAnswer,
      options,
    );
  }
}
