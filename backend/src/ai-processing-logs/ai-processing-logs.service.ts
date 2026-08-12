import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AIOperation,
  AIProcessingStatus,
  Prisma,
} from '../../generated/prisma/client';

@Injectable()
export class AiProcessingLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.aIProcessingLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    knowledgeId: string,
    operation: AIOperation,
    input: Prisma.InputJsonValue,
    model: string,
  ) {
    return this.prisma.aIProcessingLog.create({
      data: {
        knowledgeId,
        operation,
        input,
        model,
        status: AIProcessingStatus.PENDING,
      },
    });
  }
}
