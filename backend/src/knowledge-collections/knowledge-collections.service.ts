import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
        description: description || null,
      },
    });
  }

  async update(
    collectionId: string,
    accountId: string,
    name: string,
    description?: string,
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

    return this.prisma.knowledgeCollection.update({
      where: {
        id: collectionId,
      },
      data: {
        name,
        description: description || null,
      },
    });
  }

  async remove(collectionId: string, accountId: string) {
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

    const knowledgeCount = await this.prisma.knowledge.count({
      where: {
        collectionId,
      },
    });

    if (knowledgeCount > 0) {
      throw new BadRequestException(
        'Collection contains knowledge and cannot be deleted',
      );
    }

    return this.prisma.knowledgeCollection.delete({
      where: {
        id: collectionId,
      },
    });
  }
}
