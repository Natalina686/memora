import { Body, Controller, Get, Post } from '@nestjs/common';
import { KnowledgeCollectionsService } from './knowledge-collections.service';

@Controller('knowledge-collections')
export class KnowledgeCollectionsController {
  constructor(
    private readonly knowledgeCollectionsService: KnowledgeCollectionsService,
  ) {}

  @Get()
  findAll() {
    return this.knowledgeCollectionsService.findAll();
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.knowledgeCollectionsService.create(
      learnerId,
      name,
      description,
    );
  }
}
