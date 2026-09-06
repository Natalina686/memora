import { BadRequestException, NotFoundException } from '@nestjs/common';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { Test, TestingModule } from '@nestjs/testing';

import { AIOperation, AIProcessingStatus } from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AiProcessingLogsService } from './ai-processing-logs.service';

type AsyncMock = (...args: unknown[]) => Promise<unknown>;

describe('AiProcessingLogsService', () => {
  let service: AiProcessingLogsService;

  const prismaMock = {
    aIProcessingLog: {
      findMany: jest.fn<AsyncMock>(),
      findFirst: jest.fn<AsyncMock>(),
      create: jest.fn<AsyncMock>(),
      update: jest.fn<AsyncMock>(),
    },

    knowledge: {
      findFirst: jest.fn<AsyncMock>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProcessingLogsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AiProcessingLogsService>(AiProcessingLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only AI logs belonging to the authenticated account', async () => {
    const logs = [
      {
        id: 'log-1',
        accountId: 'account-1',
      },
    ];

    prismaMock.aIProcessingLog.findMany.mockResolvedValue(logs);

    const result = await service.findAll('account-1');

    expect(prismaMock.aIProcessingLog.findMany).toHaveBeenCalledWith({
      where: {
        accountId: 'account-1',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    expect(result).toEqual(logs);
  });

  it('should return an owned AI processing log', async () => {
    const log = {
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: null,
      operation: AIOperation.STRUCTURE_KNOWLEDGE,
      status: AIProcessingStatus.SUCCESS,
    };

    prismaMock.aIProcessingLog.findFirst.mockResolvedValue(log);

    const result = await service.findOne('log-1', 'account-1');

    expect(prismaMock.aIProcessingLog.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'log-1',
        accountId: 'account-1',
      },
    });

    expect(result).toEqual(log);
  });

  it('should reject access to a foreign AI processing log', async () => {
    prismaMock.aIProcessingLog.findFirst.mockResolvedValue(null);

    await expect(service.findOne('foreign-log', 'account-1')).rejects.toThrow(
      NotFoundException,
    );

    await expect(service.findOne('foreign-log', 'account-1')).rejects.toThrow(
      'AI processing log not found',
    );
  });

  it('should create AI processing log with account ownership', async () => {
    const createdLog = {
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: null,
      operation: AIOperation.STRUCTURE_KNOWLEDGE,
      status: AIProcessingStatus.PENDING,
    };

    prismaMock.aIProcessingLog.create.mockResolvedValue(createdLog);

    const result = await service.create(
      AIOperation.STRUCTURE_KNOWLEDGE,
      {
        sourceContent: 'JavaScript використовує const',
      },
      'gpt-5.6-luna',
      'account-1',
    );

    expect(prismaMock.aIProcessingLog.create).toHaveBeenCalledWith({
      data: {
        operation: AIOperation.STRUCTURE_KNOWLEDGE,

        input: {
          sourceContent: 'JavaScript використовує const',
        },

        model: 'gpt-5.6-luna',

        status: AIProcessingStatus.PENDING,

        account: {
          connect: {
            id: 'account-1',
          },
        },
      },
    });

    expect(result).toEqual(createdLog);
  });

  it('should create question-generation log linked to owned knowledge', async () => {
    prismaMock.aIProcessingLog.create.mockResolvedValue({
      id: 'log-1',
    });

    await service.create(
      AIOperation.GENERATE_QUESTIONS,
      {
        knowledgeId: 'knowledge-1',
      },
      'gpt-5.6-luna',
      'account-1',
      'knowledge-1',
    );

    expect(prismaMock.aIProcessingLog.create).toHaveBeenCalledWith({
      data: {
        operation: AIOperation.GENERATE_QUESTIONS,

        input: {
          knowledgeId: 'knowledge-1',
        },

        model: 'gpt-5.6-luna',

        status: AIProcessingStatus.PENDING,

        account: {
          connect: {
            id: 'account-1',
          },
        },

        knowledge: {
          connect: {
            id: 'knowledge-1',
          },
        },
      },
    });
  });

  it('should attach owned Knowledge to a successful AI processing log', async () => {
    prismaMock.aIProcessingLog.findFirst.mockResolvedValue({
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: null,
      status: AIProcessingStatus.SUCCESS,
    });

    prismaMock.knowledge.findFirst.mockResolvedValue({
      id: 'knowledge-1',
    });

    const updatedLog = {
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: 'knowledge-1',
      status: AIProcessingStatus.SUCCESS,
    };

    prismaMock.aIProcessingLog.update.mockResolvedValue(updatedLog);

    const result = await service.attachKnowledge(
      'log-1',
      'knowledge-1',
      'account-1',
    );

    expect(prismaMock.knowledge.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'knowledge-1',
        collection: {
          learner: {
            accountId: 'account-1',
          },
        },
      },
    });

    expect(prismaMock.aIProcessingLog.update).toHaveBeenCalledWith({
      where: {
        id: 'log-1',
      },

      data: {
        knowledgeId: 'knowledge-1',
      },
    });

    expect(result).toEqual(updatedLog);
  });

  it('should reject attaching Knowledge belonging to another account', async () => {
    prismaMock.aIProcessingLog.findFirst.mockResolvedValue({
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: null,
      status: AIProcessingStatus.SUCCESS,
    });

    prismaMock.knowledge.findFirst.mockResolvedValue(null);

    await expect(
      service.attachKnowledge('log-1', 'foreign-knowledge', 'account-1'),
    ).rejects.toThrow(NotFoundException);

    await expect(
      service.attachKnowledge('log-1', 'foreign-knowledge', 'account-1'),
    ).rejects.toThrow('Knowledge not found');

    expect(prismaMock.aIProcessingLog.update).not.toHaveBeenCalled();
  });

  it('should reject approval of an unsuccessful AI processing log', async () => {
    prismaMock.aIProcessingLog.findFirst.mockResolvedValue({
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: null,
      status: AIProcessingStatus.FAILED,
    });

    await expect(
      service.attachKnowledge('log-1', 'knowledge-1', 'account-1'),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.knowledge.findFirst).not.toHaveBeenCalled();

    expect(prismaMock.aIProcessingLog.update).not.toHaveBeenCalled();
  });

  it('should reject repeated approval of the same AI processing log', async () => {
    prismaMock.aIProcessingLog.findFirst.mockResolvedValue({
      id: 'log-1',
      accountId: 'account-1',
      knowledgeId: 'knowledge-existing',
      status: AIProcessingStatus.SUCCESS,
    });

    await expect(
      service.attachKnowledge('log-1', 'knowledge-1', 'account-1'),
    ).rejects.toThrow('This AI processing result has already been approved');

    expect(prismaMock.knowledge.findFirst).not.toHaveBeenCalled();

    expect(prismaMock.aIProcessingLog.update).not.toHaveBeenCalled();
  });
});
