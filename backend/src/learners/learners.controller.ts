import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { LearnersService } from './learners.service';

@Controller('learners')
@UseGuards(JwtAuthGuard)
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.learnersService.findAllForAccount(request.user!.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.learnersService.findOneForAccount(id, request.user!.accountId);
  }

  @Post()
  create(@Body('name') name: string, @Req() request: AuthenticatedRequest) {
    if (!name?.trim()) {
      throw new BadRequestException('Learner name is required');
    }

    return this.learnersService.create(request.user!.accountId, name.trim());
  }

  @Patch(':id/telegram')
  setTelegramChatId(
    @Param('id') id: string,
    @Body('telegramChatId') telegramChatId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!telegramChatId?.trim()) {
      throw new BadRequestException('telegramChatId is required');
    }

    return this.learnersService.setTelegramChatId(
      id,
      request.user!.accountId,
      telegramChatId.trim(),
    );
  }
}
