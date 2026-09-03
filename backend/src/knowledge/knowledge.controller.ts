import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.knowledgeService.findAll(request.user!.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.knowledgeService.findOne(id, request.user!.accountId);
  }

  @Post()
  create(
    @Body('collectionId') collectionId: string,
    @Body('title') title: string,
    @Body('sourceContent') sourceContent: string,
    @Body('structuredData') structuredData: Prisma.InputJsonValue,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.knowledgeService.create(
      collectionId,
      request.user!.accountId,
      title,
      sourceContent,
      structuredData,
    );
  }
}
