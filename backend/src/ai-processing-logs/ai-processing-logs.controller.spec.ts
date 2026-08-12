import { Test, TestingModule } from '@nestjs/testing';
import { AiProcessingLogsController } from './ai-processing-logs.controller';

describe('AiProcessingLogsController', () => {
  let controller: AiProcessingLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiProcessingLogsController],
    }).compile();

    controller = module.get<AiProcessingLogsController>(AiProcessingLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
