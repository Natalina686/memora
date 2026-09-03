import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(id: string) {
    const log = await this.prisma.aIProcessingLog.findUnique({
      where: {
        id,
      },
    });

    if (!log) {
      throw new NotFoundException('AI processing log not found');
    }

    return log;
  }

  async create(
    operation: AIOperation,
    input: Prisma.InputJsonValue,
    model: string,
    knowledgeId?: string,
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

  async markSuccess(id: string, output: Prisma.InputJsonValue) {
    return this.prisma.aIProcessingLog.update({
      where: {
        id,
      },
      data: {
        output,
        status: AIProcessingStatus.SUCCESS,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, errorMessage: string) {
    return this.prisma.aIProcessingLog.update({
      where: {
        id,
      },
      data: {
        output: {
          error: errorMessage,
        },
        status: AIProcessingStatus.FAILED,
        completedAt: new Date(),
      },
    });
  }

  async attachKnowledge(id: string, knowledgeId: string) {
    const log = await this.findOne(id);

    if (log.status !== AIProcessingStatus.SUCCESS) {
      throw new BadRequestException(
        'Only successful AI processing can be approved',
      );
    }

    if (log.knowledgeId) {
      throw new BadRequestException(
        'This AI processing result has already been approved',
      );
    }

    return this.prisma.aIProcessingLog.update({
      where: {
        id,
      },
      data: {
        knowledgeId,
      },
    });
  }
}
