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
    @Body('operation') operation: AIOperation,
    @Body('input') input: Prisma.InputJsonValue,
    @Body('model') model: string,
    @Body('knowledgeId') knowledgeId?: string,
  ) {
    return this.aiProcessingLogsService.create(
      operation,
      input,
      model,
      knowledgeId,
    );
  }
}
