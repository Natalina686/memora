import { Module } from '@nestjs/common';
import { KnowledgeCollectionsController } from './knowledge-collections.controller';
import { KnowledgeCollectionsService } from './knowledge-collections.service';

@Module({
  controllers: [KnowledgeCollectionsController],
  providers: [KnowledgeCollectionsService]
})
export class KnowledgeCollectionsModule {}
