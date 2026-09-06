import { BadRequestException, NotFoundException } from '@nestjs/common';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { AnswersService } from './answers.service';

type AsyncMock = (...args: unknown[]) => Promise<unknown>;

describe('AnswersService', () => {
  let service: AnswersService;

  const prismaMock = {
    quizSession: {
      findFirst: jest.fn<AsyncMock>(),
    },

    question: {
      findFirst: jest.fn<AsyncMock>(),
    },

    answer: {
      findMany: jest.fn<AsyncMock>(),
      create: jest.fn<AsyncMock>(),
    },
  };

  const learningProgressServiceMock = {
    processAnswer: jest.fn<AsyncMock>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswersService,
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

    service = module.get<AnswersService>(AnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only answers that belong to the authenticated account', async () => {
    const answers = [
      {
        id: 'answer-1',
      },
      {
        id: 'answer-2',
      },
    ];

    prismaMock.answer.findMany.mockResolvedValue(answers);

    const result = await service.findAll('account-1');

    expect(prismaMock.answer.findMany).toHaveBeenCalledWith({
      where: {
        quizSession: {
          learner: {
            accountId: 'account-1',
          },
        },
      },
      orderBy: {
        answeredAt: 'desc',
      },
    });

    expect(result).toEqual(answers);
  });

  it('should create a correct answer and update learning progress', async () => {
    const session = {
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    };

    const question = {
      id: 'question-1',
      knowledgeId: 'knowledge-1',
      correctAnswer: 'const',
    };

    const createdAnswer = {
      id: 'answer-1',
      quizSessionId: 'session-1',
      questionId: 'question-1',
      answer: 'const',
      isCorrect: true,
      answeredAt: new Date(),
    };

    prismaMock.quizSession.findFirst.mockResolvedValue(session);

    prismaMock.question.findFirst.mockResolvedValue(question);

    prismaMock.answer.create.mockResolvedValue(createdAnswer);

    learningProgressServiceMock.processAnswer.mockResolvedValue({});

    const result = await service.create(
      'session-1',
      'question-1',
      'const',
      'account-1',
    );

    expect(prismaMock.quizSession.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        learner: {
          accountId: 'account-1',
        },
      },
    });

    expect(prismaMock.question.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'question-1',
        knowledge: {
          collection: {
            learnerId: 'learner-1',
            learner: {
              accountId: 'account-1',
            },
          },
        },
      },
    });

    expect(prismaMock.answer.create).toHaveBeenCalledWith({
      data: {
        quizSessionId: 'session-1',
        questionId: 'question-1',
        answer: 'const',
        isCorrect: true,
      },
    });

    expect(learningProgressServiceMock.processAnswer).toHaveBeenCalledWith(
      'learner-1',
      'knowledge-1',
      true,
    );

    expect(result).toEqual(createdAnswer);
  });

  it('should create an incorrect answer and update learning progress', async () => {
    const session = {
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    };

    const question = {
      id: 'question-1',
      knowledgeId: 'knowledge-1',
      correctAnswer: 'const',
    };

    const createdAnswer = {
      id: 'answer-1',
      quizSessionId: 'session-1',
      questionId: 'question-1',
      answer: 'let',
      isCorrect: false,
      answeredAt: new Date(),
    };

    prismaMock.quizSession.findFirst.mockResolvedValue(session);

    prismaMock.question.findFirst.mockResolvedValue(question);

    prismaMock.answer.create.mockResolvedValue(createdAnswer);

    learningProgressServiceMock.processAnswer.mockResolvedValue({});

    const result = await service.create(
      'session-1',
      'question-1',
      'let',
      'account-1',
    );

    expect(prismaMock.answer.create).toHaveBeenCalledWith({
      data: {
        quizSessionId: 'session-1',
        questionId: 'question-1',
        answer: 'let',
        isCorrect: false,
      },
    });

    expect(learningProgressServiceMock.processAnswer).toHaveBeenCalledWith(
      'learner-1',
      'knowledge-1',
      false,
    );

    expect(result).toEqual(createdAnswer);
  });

  it('should reject access to a quiz session that does not belong to the account', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue(null);

    await expect(
      service.create('foreign-session', 'question-1', 'const', 'account-1'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.create('foreign-session', 'question-1', 'const', 'account-1'),
    ).rejects.toThrow('Quiz session not found');

    expect(prismaMock.question.findFirst).not.toHaveBeenCalled();

    expect(prismaMock.answer.create).not.toHaveBeenCalled();

    expect(learningProgressServiceMock.processAnswer).not.toHaveBeenCalled();
  });

  it('should reject answers for a completed quiz session', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue({
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: new Date(),
    });

    await expect(
      service.create('session-1', 'question-1', 'const', 'account-1'),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.create('session-1', 'question-1', 'const', 'account-1'),
    ).rejects.toThrow('Quiz session has already been completed');

    expect(prismaMock.question.findFirst).not.toHaveBeenCalled();

    expect(prismaMock.answer.create).not.toHaveBeenCalled();

    expect(learningProgressServiceMock.processAnswer).not.toHaveBeenCalled();
  });

  it('should reject a question that does not belong to the session learner', async () => {
    prismaMock.quizSession.findFirst.mockResolvedValue({
      id: 'session-1',
      learnerId: 'learner-1',
      completedAt: null,
    });

    prismaMock.question.findFirst.mockResolvedValue(null);

    await expect(
      service.create('session-1', 'foreign-question', 'const', 'account-1'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.create('session-1', 'foreign-question', 'const', 'account-1'),
    ).rejects.toThrow('Question not found');

    expect(prismaMock.question.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'foreign-question',
        knowledge: {
          collection: {
            learnerId: 'learner-1',
            learner: {
              accountId: 'account-1',
            },
          },
        },
      },
    });

    expect(prismaMock.answer.create).not.toHaveBeenCalled();

    expect(learningProgressServiceMock.processAnswer).not.toHaveBeenCalled();
  });
});
