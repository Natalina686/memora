import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LearningProgressModule } from 'src/learning-progress/learning-progress.module';

@Module({
  imports: [PrismaModule, LearningProgressModule],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
