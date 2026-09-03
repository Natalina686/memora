import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async findAll(accountId: string) {
    return this.prisma.notification.findMany({
      where: {
        learner: {
          accountId,
        },
      },
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
    accountId: string,
  ) {
    const learner = await this.prisma.learner.findFirst({
      where: {
        id: learnerId,
        accountId,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    return this.prisma.notification.create({
      data: {
        learnerId,
        type,
        message,
        scheduledAt,
      },
    });
  }

  async send(notificationId: string, accountId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        learner: {
          accountId,
        },
      },
      include: {
        learner: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.sendNotification(notification);
  }

  private async sendNotification(notification: {
    id: string;
    message: string;
    learner: {
      telegramChatId: string | null;
    };
  }) {
    if (!notification.learner.telegramChatId) {
      throw new NotFoundException('Learner does not have Telegram chat ID');
    }

    try {
      await this.telegramService.sendMessage(
        notification.learner.telegramChatId,
        notification.message,
      );

      return this.prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

  async processPendingNotifications() {
    const notifications = await this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        learner: true,
      },
    });

    for (const notification of notifications) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        this.logger.error(
          `Failed to send notification ${notification.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    waitForCompletion: true,
  })
  async handleScheduledNotifications() {
    await this.processPendingNotifications();
  }
}
