import { Module } from '@nestjs/common';
import { AiProcessingLogsModule } from 'src/ai-processing-logs/ai-processing-logs.module';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';
import { QuestionsModule } from 'src/questions/questions.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [AiProcessingLogsModule, KnowledgeModule, QuestionsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
