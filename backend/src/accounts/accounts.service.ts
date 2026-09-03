import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.account.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const account = await this.prisma.account.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: {
        email,
      },
    });
  }

  async create(email: string, passwordHash: string) {
    const existingAccount = await this.findByEmail(email);

    if (existingAccount) {
      throw new ConflictException('Account with this email already exists');
    }

    return this.prisma.account.create({
      data: {
        email,
        passwordHash,
      },
    });
  }
}
