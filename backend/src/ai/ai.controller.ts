import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('structure-knowledge')
  async structureKnowledge(@Body('sourceContent') sourceContent: string) {
    if (
      !sourceContent ||
      typeof sourceContent !== 'string' ||
      !sourceContent.trim()
    ) {
      throw new BadRequestException('sourceContent is required');
    }

    return this.aiService.structureKnowledge(sourceContent.trim());
  }

  @Post('processing/:id/approve')
  async approveStructuredKnowledge(
    @Param('id') processingLogId: string,
    @Body('collectionId') collectionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!collectionId?.trim()) {
      throw new BadRequestException('collectionId is required');
    }

    return this.aiService.approveStructuredKnowledge(
      processingLogId,
      collectionId.trim(),
      request.user!.accountId,
    );
  }

  @Post('knowledge/:knowledgeId/generate-questions')
  async generateQuestions(
    @Param('knowledgeId') knowledgeId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.generateQuestions(
      knowledgeId,
      request.user!.accountId,
    );
  }
}
