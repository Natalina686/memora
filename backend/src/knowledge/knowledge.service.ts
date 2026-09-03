import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.knowledge.findMany({
      where: {
        collection: {
          learner: {
            accountId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, accountId: string) {
    const knowledge = await this.prisma.knowledge.findFirst({
      where: {
        id,
        collection: {
          learner: {
            accountId,
          },
        },
      },
    });

    if (!knowledge) {
      throw new NotFoundException('Knowledge not found');
    }

    return knowledge;
  }

  async create(
    collectionId: string,
    accountId: string,
    title: string,
    sourceContent: string,
    structuredData: Prisma.InputJsonValue,
  ) {
    const collection = await this.prisma.knowledgeCollection.findFirst({
      where: {
        id: collectionId,
        learner: {
          accountId,
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Knowledge collection not found');
    }

    return this.prisma.knowledge.create({
      data: {
        collectionId,
        title,
        sourceContent,
        structuredData,
      },
    });
  }
}
