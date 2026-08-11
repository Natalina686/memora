import { Body, Controller, Get, Post } from 
'@nestjs/common';
import { LearnersService } from './learners.service';

@Controller('learners')
export class LearnersController {
  constructor(private readonly learnersService: 
LearnersService) {}

  @Get()
  findAll() {
    return this.learnersService.findAll();
  }

  @Post()
  create(@Body() body: { accountId: string; name: string }) 
{
    return this.learnersService.create(body.accountId, 
body.name);
  }
}
