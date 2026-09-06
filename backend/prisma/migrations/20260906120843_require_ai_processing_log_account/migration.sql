/*
  Warnings:

  - Made the column `accountId` on table `AIProcessingLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AIProcessingLog" ALTER COLUMN "accountId" SET NOT NULL;
