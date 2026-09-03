import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAccount(accountId: string) {
    return this.prisma.learner.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneForAccount(id: string, accountId: string) {
    const learner = await this.prisma.learner.findFirst({
      where: {
        id,
        accountId,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    return learner;
  }

  async create(accountId: string, name: string) {
    return this.prisma.learner.create({
      data: {
        accountId,
        name,
      },
    });
  }

  async setTelegramChatId(
    id: string,
    accountId: string,
    telegramChatId: string,
  ) {
    await this.findOneForAccount(id, accountId);

    return this.prisma.learner.update({
      where: {
        id,
      },
      data: {
        telegramChatId,
      },
    });
  }
}
