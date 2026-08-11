import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeCollectionsService } from './knowledge-collections.service';

describe('KnowledgeCollectionsService', () => {
  let service: KnowledgeCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeCollectionsService],
    }).compile();

    service = module.get<KnowledgeCollectionsService>(KnowledgeCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
