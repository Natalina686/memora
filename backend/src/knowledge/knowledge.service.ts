import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.knowledge.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    collectionId: string,
    title: string,
    sourceContent: string,
    structuredData: any,
  ) {
    return this.prisma.knowledge.create({
      data: {
        collectionId,
        title,
        sourceContent,
        structuredData,
      },
    });
  }
}
