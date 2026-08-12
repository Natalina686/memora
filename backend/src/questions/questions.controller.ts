import { Body, Controller, Get, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Post()
  create(
    @Body('knowledgeId') knowledgeId: string,
    @Body('type') type: 'OPEN_TEXT' | 'SINGLE_CHOICE' | 'TRUE_FALSE',
    @Body('prompt') prompt: string,
    @Body('correctAnswer') correctAnswer: any,
    @Body('options') options?: any,
  ) {
    return this.questionsService.create(
      knowledgeId,
      type,
      prompt,
      correctAnswer,
      options,
    );
  }
}
