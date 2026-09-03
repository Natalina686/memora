import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';

@Injectable()
export class AnswersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningProgressService: LearningProgressService,
  ) {}

  async findAll(accountId: string) {
    return this.prisma.answer.findMany({
      where: {
        quizSession: {
          learner: {
            accountId,
          },
        },
      },
      orderBy: {
        answeredAt: 'desc',
      },
    });
  }

  async create(
    quizSessionId: string,
    questionId: string,
    answer: Prisma.InputJsonValue,
    accountId: string,
  ) {
    const session = await this.prisma.quizSession.findFirst({
      where: {
        id: quizSessionId,
        learner: {
          accountId,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Quiz session not found');
    }

    if (session.completedAt) {
      throw new BadRequestException('Quiz session has already been completed');
    }

    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        knowledge: {
          collection: {
            learnerId: session.learnerId,
            learner: {
              accountId,
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const isCorrect =
      JSON.stringify(answer) === JSON.stringify(question.correctAnswer);

    const createdAnswer = await this.prisma.answer.create({
      data: {
        quizSessionId,
        questionId,
        answer,
        isCorrect,
      },
    });

    await this.learningProgressService.processAnswer(
      session.learnerId,
      question.knowledgeId,
      isCorrect,
    );

    return createdAnswer;
  }
}
