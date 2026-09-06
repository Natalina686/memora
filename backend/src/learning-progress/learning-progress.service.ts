import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

interface SM2Result {
  repetition: number;
  easinessFactor: number;
  interval: number;
  nextReviewAt: Date;
}

@Injectable()
export class LearningProgressService {
  private readonly MIN_EASINESS_FACTOR = 1.3;
  private readonly INITIAL_EASINESS_FACTOR = 2.5;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.learningProgress.findMany({
      where: {
        learner: {
          accountId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        knowledge: {
          select: {
            id: true,
            title: true,
          },
        },
        learner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(learnerId: string, knowledgeId: string, accountId: string) {
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

    return this.prisma.learningProgress.create({
      data: {
        learnerId,
        knowledgeId,
      },
    });
  }

  async processAnswer(
    learnerId: string,
    knowledgeId: string,
    correct: boolean,
  ) {
    const quality = correct ? 4 : 2;

    let progress = await this.prisma.learningProgress.findUnique({
      where: {
        learnerId_knowledgeId: {
          learnerId,
          knowledgeId,
        },
      },
    });

    if (!progress) {
      progress = await this.prisma.learningProgress.create({
        data: {
          learnerId,
          knowledgeId,
        },
      });
    }

    const result = this.calculateSM2(
      quality,
      progress.repetition,
      progress.easinessFactor,
      progress.interval,
    );

    const correctAnswers = progress.correctAnswers + (correct ? 1 : 0);

    const incorrectAnswers = progress.incorrectAnswers + (correct ? 0 : 1);

    const totalAnswers = correctAnswers + incorrectAnswers;

    const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

    const updatedProgress = await this.prisma.learningProgress.update({
      where: {
        id: progress.id,
      },
      data: {
        repetition: result.repetition,
        easinessFactor: result.easinessFactor,
        interval: result.interval,
        correctAnswers,
        incorrectAnswers,
        accuracy,
      },
    });

    await this.prisma.reviewSchedule.upsert({
      where: {
        learnerId_knowledgeId: {
          learnerId,
          knowledgeId,
        },
      },
      create: {
        learnerId,
        knowledgeId,
        nextReviewAt: result.nextReviewAt,
        status: 'SCHEDULED',
      },
      update: {
        nextReviewAt: result.nextReviewAt,
        status: 'SCHEDULED',
      },
    });

    return updatedProgress;
  }

  private calculateSM2(
    quality: number,
    repetition: number,
    easinessFactor: number,
    interval: number,
  ): SM2Result {
    let newRepetition = repetition;
    let newInterval = interval;

    let newEasinessFactor = easinessFactor || this.INITIAL_EASINESS_FACTOR;

    if (quality < 3) {
      newRepetition = 0;
      newInterval = 1;
    } else {
      newRepetition = repetition + 1;

      if (newRepetition === 1) {
        newInterval = 1;
      } else if (newRepetition === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEasinessFactor);
      }
    }

    newEasinessFactor =
      newEasinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    newEasinessFactor = Math.max(this.MIN_EASINESS_FACTOR, newEasinessFactor);

    const nextReviewAt = new Date();

    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    return {
      repetition: newRepetition,
      easinessFactor: Number(newEasinessFactor.toFixed(2)),
      interval: newInterval,
      nextReviewAt,
    };
  }
}
