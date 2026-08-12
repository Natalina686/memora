import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.answer.findMany({
      orderBy: {
        answeredAt: 'desc',
      },
    });
  }

  async create(
    quizSessionId: string,
    questionId: string,
    answer: Prisma.InputJsonValue,
    isCorrect: boolean,
  ) {
    return this.prisma.answer.create({
      data: {
        quizSessionId,
        questionId,
        answer,
        isCorrect,
      },
    });
  }
}
