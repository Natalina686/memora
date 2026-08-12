import { Module } from '@nestjs/common';
import { QuizSessionsController } from './quiz-sessions.controller';
import { QuizSessionsService } from './quiz-sessions.service';

@Module({
  controllers: [QuizSessionsController],
  providers: [QuizSessionsService]
})
export class QuizSessionsModule {}
