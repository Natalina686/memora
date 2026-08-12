import { Body, Controller, Get, Post } from '@nestjs/common';
import { QuizSessionsService } from './quiz-sessions.service';

@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  @Get()
  findAll() {
    return this.quizSessionsService.findAll();
  }

  @Post()
  create(@Body('learnerId') learnerId: string) {
    return this.quizSessionsService.create(learnerId);
  }
}
