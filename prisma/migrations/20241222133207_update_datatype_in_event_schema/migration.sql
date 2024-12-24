-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "disqualificationCriteria" DROP NOT NULL,
ALTER COLUMN "disqualificationCriteria" SET DATA TYPE TEXT,
ALTER COLUMN "judgementCriteria" DROP NOT NULL,
ALTER COLUMN "judgementCriteria" SET DATA TYPE TEXT;
