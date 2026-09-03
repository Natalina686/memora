import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { QuizSessionsService } from './quiz-sessions.service';

@Controller('quiz-sessions')
@UseGuards(JwtAuthGuard)
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.quizSessionsService.findAll(request.user!.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.quizSessionsService.findOne(id, request.user!.accountId);
  }

  @Get(':id/questions')
  getQuestions(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.quizSessionsService.getQuestions(id, request.user!.accountId);
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.quizSessionsService.create(learnerId, request.user!.accountId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.quizSessionsService.complete(id, request.user!.accountId);
  }
}
