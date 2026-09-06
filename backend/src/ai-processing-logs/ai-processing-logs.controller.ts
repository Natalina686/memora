import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

import { AiProcessingLogsService } from './ai-processing-logs.service';

@Controller('ai-processing-logs')
@UseGuards(JwtAuthGuard)
export class AiProcessingLogsController {
  constructor(
    private readonly aiProcessingLogsService: AiProcessingLogsService,
  ) {}

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.aiProcessingLogsService.findAll(request.user!.accountId);
  }
}
