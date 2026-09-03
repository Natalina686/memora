import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.notificationsService.findAll(request.user!.accountId);
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('type') type: string,
    @Body('message') message: string,
    @Body('scheduledAt') scheduledAt: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificationsService.create(
      learnerId,
      type,
      message,
      new Date(scheduledAt),
      request.user!.accountId,
    );
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.notificationsService.send(id, request.user!.accountId);
  }
}
