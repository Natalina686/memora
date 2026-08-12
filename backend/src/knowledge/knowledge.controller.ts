import { Body, Controller, Get, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll() {
    return this.knowledgeService.findAll();
  }

  @Post()
  create(
    @Body('collectionId') collectionId: string,
    @Body('title') title: string,
    @Body('sourceContent') sourceContent: string,
    @Body('structuredData') structuredData: any,
  ) {
    return this.knowledgeService.create(
      collectionId,
      title,
      sourceContent,
      structuredData,
    );
  }
}
