import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  async create(
    learnerId: string,
    type: string,
    message: string,
    scheduledAt: Date,
  ) {
    return this.prisma.notification.create({
      data: {
        learnerId,
        type,
        message,
        scheduledAt,
      },
    });
  }
}
