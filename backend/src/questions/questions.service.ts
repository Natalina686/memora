import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    knowledgeId: string,
    type: 'OPEN_TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' 
| 'TRUE_FALSE',
    prompt: string,
    correctAnswer: any,
    options?: any,
  ) {
    return this.prisma.question.create({
      data: {
        knowledgeId,
        type,
        prompt,
        correctAnswer,
        options,
      },
    });
  }
}
