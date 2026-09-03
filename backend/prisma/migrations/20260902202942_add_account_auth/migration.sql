ALTER TABLE "Account"
ADD COLUMN "email" TEXT,
ADD COLUMN "passwordHash" TEXT;

UPDATE "Account"
SET
  "email" = 'legacy@memora.local',
  "passwordHash" = 'LEGACY_ACCOUNT_PASSWORD_NOT_SET'
WHERE "email" IS NULL;

ALTER TABLE "Account"
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE UNIQUE INDEX "Account_email_key"
ON "Account"("email");