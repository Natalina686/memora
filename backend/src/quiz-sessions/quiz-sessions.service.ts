import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.quizSession.findMany({
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  async create(learnerId: string) {
    return this.prisma.quizSession.create({
      data: {
        learnerId,
      },
    });
  }
}
