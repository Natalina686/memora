-- AlterTable
ALTER TABLE "AIProcessingLog" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE INDEX "AIProcessingLog_accountId_idx" ON "AIProcessingLog"("accountId");

-- AddForeignKey
ALTER TABLE "AIProcessingLog" ADD CONSTRAINT "AIProcessingLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
