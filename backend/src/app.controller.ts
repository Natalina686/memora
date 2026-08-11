import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      name: 'Memora API',
      version: '1.0',
      status: 'ok',
    };
  }
}
