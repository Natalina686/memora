import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { ConfigModule } from '@nestjs/config';
import { LearnersModule } from './learners/learners.module';
import { KnowledgeCollectionsModule } from './knowledge-collections/knowledge-collections.module';

@Module({
  imports: [
ConfigModule.forRoot({ isGlobal: true }),
PrismaModule, 
AccountsModule, LearnersModule, KnowledgeCollectionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
