import { Body, Controller, Get, Post } from '@nestjs/common';
import { LearningProgressService } from './learning-progress.service';

@Controller('learning-progress')
export class LearningProgressController {
  constructor(
    private readonly learningProgressService: LearningProgressService,
  ) {}

  @Get()
  findAll() {
    return this.learningProgressService.findAll();
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('knowledgeId') knowledgeId: string,
  ) {
    return this.learningProgressService.create(learnerId, knowledgeId);
  }
}
