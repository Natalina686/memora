import { Module } from '@nestjs/common';

import { LearningProgressModule } from '../learning-progress/learning-progress.module';

import { QuizSessionsController } from './quiz-sessions.controller';
import { QuizSessionsService } from './quiz-sessions.service';

@Module({
  imports: [LearningProgressModule],
  controllers: [QuizSessionsController],
  providers: [QuizSessionsService],
})
export class QuizSessionsModule {}
