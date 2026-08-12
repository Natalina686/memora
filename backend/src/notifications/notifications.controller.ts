import { Body, Controller, Get, Post } from 
'@nestjs/common';
import { NotificationsService } from 
'./notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: 
NotificationsService,
  ) {}

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Post()
  create(
    @Body('learnerId') learnerId: string,
    @Body('type') type: string,
    @Body('message') message: string,
    @Body('scheduledAt') scheduledAt: string,
  ) {
    return this.notificationsService.create(
      learnerId,
      type,
      message,
      new Date(scheduledAt),
    );
  }
}
