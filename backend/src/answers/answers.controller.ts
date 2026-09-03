import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { AnswersService } from './answers.service';

@Controller('answers')
@UseGuards(JwtAuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.answersService.findAll(request.user!.accountId);
  }

  @Post()
  create(
    @Body('quizSessionId') quizSessionId: string,
    @Body('questionId') questionId: string,
    @Body('answer') answer: Prisma.InputJsonValue,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.answersService.create(
      quizSessionId,
      questionId,
      answer,
      request.user!.accountId,
    );
  }
}
