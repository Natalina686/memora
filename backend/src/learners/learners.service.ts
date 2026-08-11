import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LearnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.learner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(accountId: string, name: string) {
    return this.prisma.learner.create({
      data: {
        accountId,
        name,
      },
    });
  }
}
