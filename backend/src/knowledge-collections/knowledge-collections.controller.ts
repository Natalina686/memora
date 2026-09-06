import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { KnowledgeCollectionsService } from './knowledge-collections.service';

@Controller('knowledge-collections')
@UseGuards(JwtAuthGuard)
export class KnowledgeCollectionsController {
  constructor(
    private readonly knowledgeCollectionsService: KnowledgeCollectionsService,
  ) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.knowledgeCollectionsService.findAll(request.user!.accountId);
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('name') name: string,
    @Body('description') description: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!learnerId?.trim()) {
      throw new BadRequestException('learnerId is required');
    }

    if (!name?.trim()) {
      throw new BadRequestException('name is required');
    }

    return this.knowledgeCollectionsService.create(
      learnerId.trim(),
      request.user!.accountId,
      name.trim(),
      description?.trim(),
    );
  }

  @Patch(':id')
  update(
    @Param('id') collectionId: string,
    @Body('name') name: string,
    @Body('description') description: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!name?.trim()) {
      throw new BadRequestException('name is required');
    }

    return this.knowledgeCollectionsService.update(
      collectionId,
      request.user!.accountId,
      name.trim(),
      description?.trim(),
    );
  }

  @Delete(':id')
  remove(
    @Param('id') collectionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.knowledgeCollectionsService.remove(
      collectionId,
      request.user!.accountId,
    );
  }
}
