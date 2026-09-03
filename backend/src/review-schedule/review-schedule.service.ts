import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.reviewSchedule.findMany({
      where: {
        learner: {
          accountId,
        },
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
    });
  }

  async findDueReviews(accountId: string) {
    return this.prisma.reviewSchedule.findMany({
      where: {
        status: 'SCHEDULED',
        nextReviewAt: {
          lte: new Date(),
        },
        learner: {
          accountId,
        },
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
      include: {
        knowledge: true,
        learner: true,
      },
    });
  }

  async create(
    learnerId: string,
    knowledgeId: string,
    nextReviewAt: Date,
    accountId: string,
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

    const knowledge = await this.prisma.knowledge.findFirst({
      where: {
        id: knowledgeId,
        collection: {
          learnerId,
          learner: {
            accountId,
          },
        },
      },
    });

    if (!knowledge) {
      throw new NotFoundException('Knowledge not found');
    }

    return this.prisma.reviewSchedule.create({
      data: {
        learnerId,
        knowledgeId,
        nextReviewAt,
      },
    });
  }

  async findDueReviewsForLearner(learnerId: string, accountId: string) {
    const learner = await this.prisma.learner.findFirst({
      where: {
        id: learnerId,
        accountId,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    return this.prisma.reviewSchedule.findMany({
      where: {
        learnerId,
        status: 'SCHEDULED',
        nextReviewAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        nextReviewAt: 'asc',
      },
      include: {
        knowledge: {
          include: {
            questions: {
              select: {
                id: true,
                knowledgeId: true,
                type: true,
                prompt: true,
                options: true,
              },
            },
          },
        },
      },
    });
  }
}
