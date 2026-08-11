import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeCollectionsController } from './knowledge-collections.controller';

describe('KnowledgeCollectionsController', () => {
  let controller: KnowledgeCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeCollectionsController],
    }).compile();

    controller = module.get<KnowledgeCollectionsController>(KnowledgeCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
