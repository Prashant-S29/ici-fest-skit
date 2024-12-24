-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "brochure" TEXT,
ADD COLUMN     "disqualificationCriteria" TEXT[],
ADD COLUMN     "judgementCriteria" TEXT[];
