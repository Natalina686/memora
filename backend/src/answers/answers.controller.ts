import { Body, Controller, Get, Post } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { AnswersService } from './answers.service';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get()
  findAll() {
    return this.answersService.findAll();
  }

  @Post()
  create(
    @Body('quizSessionId') quizSessionId: string,
    @Body('questionId') questionId: string,
    @Body('answer') answer: Prisma.InputJsonValue,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    return this.answersService.create(
      quizSessionId,
      questionId,
      answer,
      isCorrect,
    );
  }
}
