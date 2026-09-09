import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';

@Injectable()
export class QuizSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningProgressService: LearningProgressService,
  ) {}

  async findAll(accountId: string) {
    return this.prisma.quizSession.findMany({
      where: {
        learner: {
          accountId,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async findOne(id: string, accountId: string) {
    const session = await this.prisma.quizSession.findFirst({
      where: {
        id,
        learner: {
          accountId,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Quiz session not found');
    }

    return session;
  }

  async create(learnerId: string, accountId: string) {
    const learner = await this.prisma.learner.findFirst({
      where: {
        id: learnerId,
        accountId,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    return this.prisma.quizSession.create({
      data: {
        learnerId,
      },
    });
  }

  async getQuestions(id: string, accountId: string) {
    const session = await this.findOne(id, accountId);

    if (session.completedAt) {
      throw new BadRequestException('Quiz session has already been completed');
    }

    const now = new Date();

    return this.prisma.question.findMany({
      where: {
        knowledge: {
          collection: {
            learnerId: session.learnerId,
          },
          OR: [
            {
              // New Knowledge that has never been reviewed.
              reviewSchedules: {
                none: {
                  learnerId: session.learnerId,
                },
              },
            },
            {
              // Knowledge whose scheduled review is already due.
              reviewSchedules: {
                some: {
                  learnerId: session.learnerId,
                  status: 'SCHEDULED',
                  nextReviewAt: {
                    lte: now,
                  },
                },
              },
            },
          ],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        knowledgeId: true,
        type: true,
        prompt: true,
        options: true,
      },
    });
  }

  async complete(id: string, accountId: string) {
    const session = await this.findOne(id, accountId);

    if (session.completedAt) {
      throw new BadRequestException('Quiz session has already been completed');
    }

    const answers = await this.prisma.answer.findMany({
      where: {
        quizSessionId: id,
      },
      select: {
        isCorrect: true,
        question: {
          select: {
            knowledgeId: true,
          },
        },
      },
    });

    const resultsByKnowledge = new Map<
      string,
      {
        correct: number;
        incorrect: number;
      }
    >();

    for (const answer of answers) {
      const knowledgeId = answer.question.knowledgeId;

      const current = resultsByKnowledge.get(knowledgeId) ?? {
        correct: 0,
        incorrect: 0,
      };

      if (answer.isCorrect) {
        current.correct += 1;
      } else {
        current.incorrect += 1;
      }

      resultsByKnowledge.set(knowledgeId, current);
    }

    for (const [knowledgeId, result] of resultsByKnowledge) {
      await this.learningProgressService.processKnowledgeReview(
        session.learnerId,
        knowledgeId,
        result.correct,
        result.incorrect,
      );
    }

    return this.prisma.quizSession.update({
      where: {
        id,
      },
      data: {
        completedAt: new Date(),
      },
      include: {
        answers: true,
      },
    });
  }
}
