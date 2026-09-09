import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { PrismaService } from '../prisma/prisma.service';

import { QuizSessionsService } from './quiz-sessions.service';

type AsyncMock = (...args: unknown[]) => Promise<unknown>;

describe('QuizSessionsService', () => {
  let service: QuizSessionsService;

  const prismaMock = {
    quizSession: {
      findMany: jest.fn<AsyncMock>(),
      findFirst: jest.fn<AsyncMock>(),
      create: jest.fn<AsyncMock>(),
      update: jest.fn<AsyncMock>(),
    },

    learner: {
      findFirst: jest.fn<AsyncMock>(),
    },

    question: {
      findMany: jest.fn<AsyncMock>(),
    },

    answer: {
      findMany: jest.fn<AsyncMock>(),
    },
  };

  const learningProgressServiceMock = {
    processKnowledgeReview: jest.fn<AsyncMock>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizSessionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: LearningProgressService,
          useValue: learningProgressServiceMock,
        },
      ],
    }).compile();

    service = module.get<QuizSessionsService>(QuizSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only quiz sessions belonging to the authenticated account', async () => {
    const sessions = [
      {
        id: 'session-1',
      },
      {
        id: 'session-2',
      },
    ];

    prismaMock.quizSession.findMany.mockResolvedValue(sessions);

    const result = await service.findAll('account-1');

    expect(prismaMock.quizSession.findMany).toHaveBeenCalledWith({
      where: {
        learner: {
          accountId: 'account-1',
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    expect(result).toEqual(sessions);
  });

  it('should return owned quiz session', async () => {
    const session = {
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    };

    prismaMock.quizSession.findFirst.mockResolvedValue(session);

    const result = await service.findOne('session-1', 'account-1');

    expect(prismaMock.quizSession.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        learner: {
          accountId: 'account-1',
        },
      },
    });

    expect(result).toEqual(session);
  });

  it('should reject access to a foreign quiz session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('foreign-session', 'account-1'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.findOne('foreign-session', 'account-1'),
    ).rejects.toThrow('Quiz session not found');
  });

  it('should create quiz session only for learner belonging to the account', async () => {
    prismaMock.learner.findFirst.mockResolvedValue({
      id: 'learner-1',
      accountId: 'account-1',
    });

    const createdSession = {
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    };

    prismaMock.quizSession.create.mockResolvedValue(createdSession);

    const result = await service.create('learner-1', 'account-1');

    expect(prismaMock.learner.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'learner-1',
        accountId: 'account-1',
      },
    });

    expect(prismaMock.quizSession.create).toHaveBeenCalledWith({
      data: {
        learnerId: 'learner-1',
      },
    });

    expect(result).toEqual(createdSession);
  });

  it('should reject creation for learner belonging to another account', async () => {
    prismaMock.learner.findFirst.mockResolvedValue(null);

    await expect(
      service.create('foreign-learner', 'account-1'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.create('foreign-learner', 'account-1'),
    ).rejects.toThrow('Learner not found');

    expect(prismaMock.quizSession.create).not.toHaveBeenCalled();
  });

  it('should return new and due questions without correctAnswer', async () => {
    const session = {
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    };

    prismaMock.quizSession.findFirst.mockResolvedValue(session);

    const questions = [
      {
        id: 'question-1',
        knowledgeId: 'knowledge-1',
        type: 'OPEN_TEXT',
        prompt: 'Що оголошує змінну?',
        options: null,
      },
    ];

    prismaMock.question.findMany.mockResolvedValue(questions);

    const result = await service.getQuestions('session-1', 'account-1');

    expect(prismaMock.question.findMany).toHaveBeenCalledWith({
      where: {
        knowledge: {
          collection: {
            learnerId: 'learner-1',
          },
          OR: [
            {
              reviewSchedules: {
                none: {
                  learnerId: 'learner-1',
                },
              },
            },
            {
              reviewSchedules: {
                some: {
                  learnerId: 'learner-1',
                  status: 'SCHEDULED',
                  nextReviewAt: {
                    lte: expect.any(Date),
                  },
                },
              },
            },
          ],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        knowledgeId: true,
        type: true,
        prompt: true,
        options: true,
      },
    });

    expect(result).toEqual(questions);

    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          correctAnswer: expect.anything(),
        }),
      ]),
    );
  });

  it('should reject questions request for a foreign quiz session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue(null);

    await expect(
      service.getQuestions('foreign-session', 'account-1'),
    ).rejects.toThrow('Quiz session not found');

    expect(prismaMock.question.findMany).not.toHaveBeenCalled();
  });

  it('should reject questions request for completed quiz session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue({
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: new Date(),
    });

    await expect(
      service.getQuestions('session-1', 'account-1'),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.getQuestions('session-1', 'account-1'),
    ).rejects.toThrow('Quiz session has already been completed');

    expect(prismaMock.question.findMany).not.toHaveBeenCalled();
  });

  it('should complete quiz session and process each knowledge once', async () => {
    const session = {
      id: 'session-1',
      learnerId: 'learner-1',
      startedAt: new Date(),
      completedAt: null,
    };

    prismaMock.quizSession.findFirst.mockResolvedValue(session);

    prismaMock.answer.findMany.mockResolvedValue([
      {
        isCorrect: true,
        question: {
          knowledgeId: 'knowledge-1',
        },
      },
      {
        isCorrect: true,
        question: {
          knowledgeId: 'knowledge-1',
        },
      },
      {
        isCorrect: false,
        question: {
          knowledgeId: 'knowledge-1',
        },
      },
      {
        isCorrect: true,
        question: {
          knowledgeId: 'knowledge-1',
        },
      },
      {
        isCorrect: false,
        question: {
          knowledgeId: 'knowledge-2',
        },
      },
    ]);

    learningProgressServiceMock.processKnowledgeReview.mockResolvedValue({});

    const completedSession = {
      ...session,
      completedAt: new Date(),
      answers: [],
    };

    prismaMock.quizSession.update.mockResolvedValue(completedSession);

    const result = await service.complete('session-1', 'account-1');

    expect(prismaMock.answer.findMany).toHaveBeenCalledWith({
      where: {
        quizSessionId: 'session-1',
      },
      select: {
        isCorrect: true,
        question: {
          select: {
            knowledgeId: true,
          },
        },
      },
    });

    expect(
      learningProgressServiceMock.processKnowledgeReview,
    ).toHaveBeenCalledTimes(2);

    expect(
      learningProgressServiceMock.processKnowledgeReview,
    ).toHaveBeenCalledWith('learner-1', 'knowledge-1', 3, 1);

    expect(
      learningProgressServiceMock.processKnowledgeReview,
    ).toHaveBeenCalledWith('learner-1', 'knowledge-2', 0, 1);

    expect(prismaMock.quizSession.update).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
      },
      data: {
        completedAt: expect.any(Date),
      },
      include: {
        answers: true,
      },
    });

    expect(result).toEqual(completedSession);
  });

  it('should reject completion of foreign quiz session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue(null);

    await expect(
      service.complete('foreign-session', 'account-1'),
    ).rejects.toThrow('Quiz session not found');

    expect(prismaMock.answer.findMany).not.toHaveBeenCalled();

    expect(
      learningProgressServiceMock.processKnowledgeReview,
    ).not.toHaveBeenCalled();

    expect(prismaMock.quizSession.update).not.toHaveBeenCalled();
  });

  it('should reject completion of already completed session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue({
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: new Date(),
    });

    await expect(service.complete('session-1', 'account-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(prismaMock.answer.findMany).not.toHaveBeenCalled();

    expect(
      learningProgressServiceMock.processKnowledgeReview,
    ).not.toHaveBeenCalled();

    expect(prismaMock.quizSession.update).not.toHaveBeenCalled();
  });
});
