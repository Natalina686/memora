import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { AIOperation, Prisma } from '../../generated/prisma/client';
import { AiProcessingLogsService } from '../ai-processing-logs/ai-processing-logs.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { QuestionsService } from 'src/questions/questions.service';

export interface StructuredKnowledge {
  title: string;
  summary: string;
  facts: Array<{
    key: string;
    value: string;
  }>;
  keywords: string[];
}

export interface GeneratedQuestion {
  type: 'OPEN_TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

  prompt: string;

  options: string[] | null;

  correctAnswer: string | string[] | boolean;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiProcessingLogsService: AiProcessingLogsService,
    private readonly knowledgeService: KnowledgeService,
    private readonly questionsService: QuestionsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }

    this.model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-5.6-luna';

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async structureKnowledge(sourceContent: string): Promise<{
    processingLogId: string;
    structuredKnowledge: StructuredKnowledge;
  }> {
    const log = await this.aiProcessingLogsService.create(
      AIOperation.STRUCTURE_KNOWLEDGE,
      {
        sourceContent,
      },
      this.model,
    );

    try {
      const response = await this.openai.responses.create({
        model: this.model,

        instructions: `
You transform user-provided information into clean learning material.

Preserve the meaning of the source.
Do not invent facts that are not present in the source.
Use the same language as the source whenever possible.
Create a concise title and summary.
Extract the important atomic facts that a learner should remember.
Keywords should contain only meaningful terms from the source.
`,

        input: sourceContent,

        text: {
          format: {
            type: 'json_schema',
            name: 'structured_knowledge',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                summary: {
                  type: 'string',
                },
                facts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      key: {
                        type: 'string',
                      },
                      value: {
                        type: 'string',
                      },
                    },
                    required: ['key', 'value'],
                    additionalProperties: false,
                  },
                },
                keywords: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['title', 'summary', 'facts', 'keywords'],
              additionalProperties: false,
            },
          },
        },
      });

      if (!response.output_text) {
        throw new Error('AI returned an empty response');
      }

      const structuredKnowledge = JSON.parse(
        response.output_text,
      ) as StructuredKnowledge;

      await this.aiProcessingLogsService.markSuccess(
        log.id,
        structuredKnowledge as unknown as Prisma.InputJsonValue,
      );

      return {
        processingLogId: log.id,
        structuredKnowledge,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown AI processing error';

      await this.aiProcessingLogsService.markFailed(log.id, message);

      throw new BadGatewayException(
        `AI knowledge processing failed: ${message}`,
      );
    }
  }
  async approveStructuredKnowledge(
    processingLogId: string,
    collectionId: string,
    accountId: string,
  ) {
    const log = await this.aiProcessingLogsService.findOne(processingLogId);

    if (log.status !== 'SUCCESS') {
      throw new BadRequestException(
        'AI processing must be successful before approval',
      );
    }

    if (log.operation !== AIOperation.STRUCTURE_KNOWLEDGE) {
      throw new BadRequestException(
        'Only structured knowledge processing can be approved',
      );
    }

    if (log.knowledgeId) {
      throw new BadRequestException('This AI result has already been approved');
    }

    if (!log.output) {
      throw new BadRequestException(
        'AI processing result does not contain output',
      );
    }

    const output = log.output as unknown as StructuredKnowledge;

    const input = log.input as {
      sourceContent?: string;
    };

    if (!input.sourceContent) {
      throw new BadRequestException(
        'AI processing log does not contain source content',
      );
    }

    const knowledge = await this.knowledgeService.create(
      collectionId,
      accountId,
      output.title,
      input.sourceContent,
      log.output,
    );

    await this.aiProcessingLogsService.attachKnowledge(
      processingLogId,
      knowledge.id,
    );

    return knowledge;
  }

  async generateQuestions(knowledgeId: string, accountId: string) {
    const knowledge = await this.knowledgeService.findOne(
      knowledgeId,
      accountId,
    );

    const log = await this.aiProcessingLogsService.create(
      AIOperation.GENERATE_QUESTIONS,
      {
        knowledgeId,
        title: knowledge.title,
        sourceContent: knowledge.sourceContent,
        structuredData: knowledge.structuredData,
      },
      this.model,
      knowledgeId,
    );

    try {
      const response = await this.openai.responses.create({
        model: this.model,

        instructions: `
You generate learning questions from structured knowledge.

Rules:

1. Generate exactly 4 questions.
2. Questions must test only information contained in the supplied knowledge.
3. Do not invent additional facts.
4. Use the same language as the knowledge.
5. Generate different question formulations.
6. Prefer these types:
   - OPEN_TEXT
   - SINGLE_CHOICE
   - TRUE_FALSE
7. SINGLE_CHOICE questions must contain exactly 4 options.
8. Only one option may be correct.
9. TRUE_FALSE correctAnswer must be boolean.
10. OPEN_TEXT correctAnswer must be a string.
`,

        input: JSON.stringify({
          title: knowledge.title,
          sourceContent: knowledge.sourceContent,
          structuredData: knowledge.structuredData,
        }),

        text: {
          format: {
            type: 'json_schema',
            name: 'generated_questions',
            strict: true,

            schema: {
              type: 'object',

              properties: {
                questions: {
                  type: 'array',

                  minItems: 4,
                  maxItems: 4,

                  items: {
                    type: 'object',

                    properties: {
                      type: {
                        type: 'string',

                        enum: [
                          'OPEN_TEXT',
                          'SINGLE_CHOICE',
                          'MULTIPLE_CHOICE',
                          'TRUE_FALSE',
                        ],
                      },

                      prompt: {
                        type: 'string',
                      },

                      options: {
                        anyOf: [
                          {
                            type: 'array',
                            items: {
                              type: 'string',
                            },
                          },
                          {
                            type: 'null',
                          },
                        ],
                      },

                      correctAnswer: {
                        anyOf: [
                          {
                            type: 'string',
                          },
                          {
                            type: 'boolean',
                          },
                          {
                            type: 'array',
                            items: {
                              type: 'string',
                            },
                          },
                        ],
                      },
                    },

                    required: ['type', 'prompt', 'options', 'correctAnswer'],

                    additionalProperties: false,
                  },
                },
              },

              required: ['questions'],

              additionalProperties: false,
            },
          },
        },
      });

      if (!response.output_text) {
        throw new Error('AI returned an empty response');
      }

      const parsed = JSON.parse(response.output_text) as {
        questions: GeneratedQuestion[];
      };

      const createdQuestions = await this.questionsService.createMany(
        knowledgeId,
        parsed.questions.map((question) => ({
          type: question.type,
          prompt: question.prompt,
          correctAnswer: question.correctAnswer,
          options: question.options === null ? undefined : question.options,
        })),
      );

      await this.aiProcessingLogsService.markSuccess(log.id, {
        questions: parsed.questions,
      } as unknown as Prisma.InputJsonValue);

      return {
        processingLogId: log.id,
        questions: createdQuestions,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown AI processing error';

      await this.aiProcessingLogsService.markFailed(log.id, message);

      throw new BadGatewayException(
        `AI question generation failed: ${message}`,
      );
    }
  }
}
