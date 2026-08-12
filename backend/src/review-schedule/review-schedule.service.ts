import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.reviewSchedule.findMany({
      orderBy: {
        nextReviewAt: 'asc',
      },
    });
  }

  async create(learnerId: string, knowledgeId: string, nextReviewAt: Date) {
    return this.prisma.reviewSchedule.create({
      data: {
        learnerId,
        knowledgeId,
        nextReviewAt,
      },
    });
  }
}
