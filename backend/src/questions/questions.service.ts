import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, QuestionType } from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface QuestionInput {
  type: QuestionType;
  prompt: string;
  correctAnswer: Prisma.InputJsonValue;
  options?: Prisma.InputJsonValue;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId: string) {
    return this.prisma.question.findMany({
      where: {
        knowledge: {
          collection: {
            learner: {
              accountId,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,
        knowledgeId: true,
        type: true,
        prompt: true,
        options: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(
    knowledgeId: string,
    accountId: string,
    type: QuestionType,
    prompt: string,
    correctAnswer: Prisma.InputJsonValue,
    options?: Prisma.InputJsonValue,
  ) {
    const knowledge = await this.prisma.knowledge.findFirst({
      where: {
        id: knowledgeId,
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

    return this.prisma.question.create({
      data: {
        knowledgeId,
        type,
        prompt,
        correctAnswer,

        ...(options !== undefined && {
          options,
        }),
      },
    });
  }

  async createMany(knowledgeId: string, questions: QuestionInput[]) {
    return this.prisma.$transaction(
      questions.map((question) =>
        this.prisma.question.create({
          data: {
            knowledgeId,
            type: question.type,
            prompt: question.prompt,
            correctAnswer: question.correctAnswer,

            ...(question.options !== undefined && {
              options: question.options,
            }),
          },
        }),
      ),
    );
  }
}
