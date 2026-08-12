import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.learningProgress.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async create(
    learnerId: string,
    knowledgeId: string,
  ) {
    return this.prisma.learningProgress.create({
      data: {
        learnerId,
        knowledgeId,
      },
    });
  }
}
