import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.account.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create() {
    return this.prisma.account.create({ data: {} });
  }
}
