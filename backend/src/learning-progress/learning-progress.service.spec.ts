import { Test, TestingModule } from '@nestjs/testing';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { PrismaService } from '../prisma/prisma.service';
import { LearningProgressService } from './learning-progress.service';

type AsyncMock = (...args: unknown[]) => Promise<unknown>;

type UpdateMock = (args: {
  data: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

describe('LearningProgressService', () => {
  let service: LearningProgressService;

  const prismaMock = {
    learningProgress: {
      findMany: jest.fn<AsyncMock>(),
      findUnique: jest.fn<AsyncMock>(),
      create: jest.fn<AsyncMock>(),
      update: jest.fn<UpdateMock>(),
    },

    reviewSchedule: {
      upsert: jest.fn<AsyncMock>(),
    },

    learner: {
      findFirst: jest.fn<AsyncMock>(),
    },

    knowledge: {
      findFirst: jest.fn<AsyncMock>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningProgressService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<LearningProgressService>(LearningProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should schedule 1 day after the first correct answer', async () => {
    const existingProgress = {
      id: 'progress-1',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 0,
      easinessFactor: 2.5,
      interval: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.findUnique.mockResolvedValue(existingProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...existingProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      true,
    );

    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easinessFactor).toBe(2.5);

    expect(result.correctAnswers).toBe(1);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.accuracy).toBe(1);

    expect(prismaMock.reviewSchedule.upsert).toHaveBeenCalledWith({
      where: {
        learnerId_knowledgeId: {
          learnerId: 'learner-1',
          knowledgeId: 'knowledge-1',
        },
      },
      create: {
        learnerId: 'learner-1',
        knowledgeId: 'knowledge-1',
        nextReviewAt: expect.any(Date),
        status: 'SCHEDULED',
      },
      update: {
        nextReviewAt: expect.any(Date),
        status: 'SCHEDULED',
      },
    });
  });

  it('should schedule 6 days after the second consecutive correct answer', async () => {
    const existingProgress = {
      id: 'progress-1',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 1,
      easinessFactor: 2.5,
      interval: 1,
      correctAnswers: 1,
      incorrectAnswers: 0,
      accuracy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.findUnique.mockResolvedValue(existingProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...existingProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      true,
    );

    expect(result.repetition).toBe(2);
    expect(result.interval).toBe(6);

    expect(result.correctAnswers).toBe(2);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.accuracy).toBe(1);
  });

  it('should calculate the next interval using easiness factor after later successful repetitions', async () => {
    const existingProgress = {
      id: 'progress-1',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 2,
      easinessFactor: 2.5,
      interval: 6,
      correctAnswers: 2,
      incorrectAnswers: 0,
      accuracy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.findUnique.mockResolvedValue(existingProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...existingProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      true,
    );

    expect(result.repetition).toBe(3);

    // 6 × 2.5 = 15
    expect(result.interval).toBe(15);

    expect(result.easinessFactor).toBe(2.5);
  });

  it('should reset repetition and interval after an incorrect answer', async () => {
    const existingProgress = {
      id: 'progress-1',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 3,
      easinessFactor: 2.5,
      interval: 15,
      correctAnswers: 3,
      incorrectAnswers: 0,
      accuracy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.findUnique.mockResolvedValue(existingProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...existingProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      false,
    );

    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);

    // q = 2: EF 2.5 → 2.18
    expect(result.easinessFactor).toBe(2.18);

    expect(result.correctAnswers).toBe(3);
    expect(result.incorrectAnswers).toBe(1);
    expect(result.accuracy).toBe(0.75);
  });

  it('should not allow easiness factor to fall below 1.3', async () => {
    const existingProgress = {
      id: 'progress-1',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 0,
      easinessFactor: 1.3,
      interval: 1,
      correctAnswers: 0,
      incorrectAnswers: 3,
      accuracy: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.findUnique.mockResolvedValue(existingProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...existingProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      false,
    );

    expect(result.easinessFactor).toBe(1.3);
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should create progress when learner has no previous progress', async () => {
    prismaMock.learningProgress.findUnique.mockResolvedValue(null);

    const createdProgress = {
      id: 'progress-new',
      learnerId: 'learner-1',
      knowledgeId: 'knowledge-1',
      repetition: 0,
      easinessFactor: 2.5,
      interval: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.learningProgress.create.mockResolvedValue(createdProgress);

    prismaMock.learningProgress.update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...createdProgress,
        ...data,
      }),
    );

    prismaMock.reviewSchedule.upsert.mockResolvedValue({
      id: 'schedule-1',
    });

    const result = await service.processAnswer(
      'learner-1',
      'knowledge-1',
      true,
    );

    expect(prismaMock.learningProgress.create).toHaveBeenCalledWith({
      data: {
        learnerId: 'learner-1',
        knowledgeId: 'knowledge-1',
      },
    });

    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.accuracy).toBe(1);
  });
});
