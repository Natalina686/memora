import { Module } from '@nestjs/common';
import { AiProcessingLogsController } from './ai-processing-logs.controller';
import { AiProcessingLogsService } from './ai-processing-logs.service';

@Module({
  controllers: [AiProcessingLogsController],
  providers: [AiProcessingLogsService]
})
export class AiProcessingLogsModule {}
