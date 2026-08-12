import { Test, TestingModule } from '@nestjs/testing';
import { AiProcessingLogsService } from './ai-processing-logs.service';

describe('AiProcessingLogsService', () => {
  let service: AiProcessingLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiProcessingLogsService],
    }).compile();

    service = module.get<AiProcessingLogsService>(AiProcessingLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
