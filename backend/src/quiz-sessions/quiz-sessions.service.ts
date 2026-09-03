import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizSessionsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.question.findMany({
      where: {
        knowledge: {
          collection: {
            learnerId: session.learnerId,
          },
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
