import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.knowledgeCollection.findMany({
      where: {
        learner: {
          accountId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    learnerId: string,
    accountId: string,
    name: string,
    description?: string,
  ) {
    const learner = await this.prisma.learner.findFirst({
      where: {
        id: learnerId,
        accountId,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    return this.prisma.knowledgeCollection.create({
      data: {
        learnerId,
        name,
        description,
      },
    });
  }
}
