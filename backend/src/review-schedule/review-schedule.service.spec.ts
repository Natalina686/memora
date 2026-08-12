import { Test, TestingModule } from '@nestjs/testing';
import { ReviewScheduleService } from './review-schedule.service';

describe('ReviewScheduleService', () => {
  let service: ReviewScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewScheduleService],
    }).compile();

    service = module.get<ReviewScheduleService>(ReviewScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
