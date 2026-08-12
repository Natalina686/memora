import { Test, TestingModule } from '@nestjs/testing';
import { QuizSessionsController } from './quiz-sessions.controller';

describe('QuizSessionsController', () => {
  let controller: QuizSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizSessionsController],
    }).compile();

    controller = module.get<QuizSessionsController>(QuizSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
