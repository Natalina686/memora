import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { ConfigModule } from '@nestjs/config';
import { LearnersModule } from './learners/learners.module';
import { KnowledgeCollectionsModule } from './knowledge-collections/knowledge-collections.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { QuestionsModule } from './questions/questions.module';
import { QuizSessionsModule } from './quiz-sessions/quiz-sessions.module';
import { AnswersModule } from './answers/answers.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { ReviewScheduleModule } from './review-schedule/review-schedule.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiProcessingLogsModule } from './ai-processing-logs/ai-processing-logs.module';

@Module({
  imports: [
ConfigModule.forRoot({ isGlobal: true }),
PrismaModule, 
AccountsModule, LearnersModule, KnowledgeCollectionsModule, KnowledgeModule, QuestionsModule, QuizSessionsModule, AnswersModule, LearningProgressModule, ReviewScheduleModule, NotificationsModule, AiProcessingLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
