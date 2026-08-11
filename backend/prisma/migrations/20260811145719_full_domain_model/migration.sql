/*
  Warnings:

  - Added the required column `updatedAt` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('OPEN_TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE');

-- CreateEnum
CREATE TYPE "AIOperation" AS ENUM ('STRUCTURE_KNOWLEDGE', 'GENERATE_QUESTIONS');

-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Learner" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Learner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeCollection" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Knowledge" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceContent" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "quizSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "easinessFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "nextReviewAt" TIMESTAMP(3) NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProcessingLog" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "operation" "AIOperation" NOT NULL DEFAULT 'STRUCTURE_KNOWLEDGE',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "model" TEXT NOT NULL,
    "status" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AIProcessingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Learner_accountId_idx" ON "Learner"("accountId");

-- CreateIndex
CREATE INDEX "KnowledgeCollection_learnerId_idx" ON "KnowledgeCollection"("learnerId");

-- CreateIndex
CREATE INDEX "Knowledge_collectionId_idx" ON "Knowledge"("collectionId");

-- CreateIndex
CREATE INDEX "Question_knowledgeId_idx" ON "Question"("knowledgeId");

-- CreateIndex
CREATE INDEX "QuizSession_learnerId_idx" ON "QuizSession"("learnerId");

-- CreateIndex
CREATE INDEX "Answer_quizSessionId_idx" ON "Answer"("quizSessionId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "LearningProgress_learnerId_idx" ON "LearningProgress"("learnerId");

-- CreateIndex
CREATE INDEX "LearningProgress_knowledgeId_idx" ON "LearningProgress"("knowledgeId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_learnerId_knowledgeId_key" ON "LearningProgress"("learnerId", "knowledgeId");

-- CreateIndex
CREATE INDEX "ReviewSchedule_nextReviewAt_idx" ON "ReviewSchedule"("nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_learnerId_knowledgeId_key" ON "ReviewSchedule"("learnerId", "knowledgeId");

-- CreateIndex
CREATE INDEX "Notification_learnerId_idx" ON "Notification"("learnerId");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_idx" ON "Notification"("scheduledAt");

-- CreateIndex
CREATE INDEX "AIProcessingLog_knowledgeId_idx" ON "AIProcessingLog"("knowledgeId");

-- CreateIndex
CREATE INDEX "AIProcessingLog_createdAt_idx" ON "AIProcessingLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Learner" ADD CONSTRAINT "Learner_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeCollection" ADD CONSTRAINT "KnowledgeCollection_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knowledge" ADD CONSTRAINT "Knowledge_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "KnowledgeCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "Learner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProcessingLog" ADD CONSTRAINT "AIProcessingLog_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "Knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
