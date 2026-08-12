import { Test, TestingModule } from '@nestjs/testing';
import { ReviewScheduleController } from './review-schedule.controller';

describe('ReviewScheduleController', () => {
  let controller: ReviewScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewScheduleController],
    }).compile();

    controller = module.get<ReviewScheduleController>(ReviewScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
