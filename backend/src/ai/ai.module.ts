import { Module } from '@nestjs/common';
import { AiProcessingLogsModule } from '../ai-processing-logs/ai-processing-logs.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { QuestionsModule } from '../questions/questions.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [AiProcessingLogsModule, KnowledgeModule, QuestionsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
