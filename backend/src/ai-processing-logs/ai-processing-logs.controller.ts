import { Body, Controller, Get, Post } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AiProcessingLogsService } from './ai-processing-logs.service';
import { AIOperation } from '../../generated/prisma/client';

@Controller('ai-processing-logs')
export class AiProcessingLogsController {
  constructor(
    private readonly aiProcessingLogsService: AiProcessingLogsService,
  ) {}

  @Get()
  findAll() {
    return this.aiProcessingLogsService.findAll();
  }

  @Post()
  create(
    @Body('knowledgeId') knowledgeId: string,
    @Body('operation') operation: AIOperation,
    @Body('input') input: Prisma.InputJsonValue,
    @Body('model') model: string,
  ) {
    return this.aiProcessingLogsService.create(
      knowledgeId,
      operation,
      input,
      model,
    );
  }
}
