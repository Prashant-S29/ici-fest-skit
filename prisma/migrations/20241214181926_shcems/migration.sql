/*
  Warnings:

  - Made the column `eventId` on table `EventCoordinator` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventId` on table `EventRegistrationForm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eventId` on table `EventSchedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EventCoordinator" ALTER COLUMN "eventId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventRegistrationForm" ALTER COLUMN "eventId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EventSchedule" ALTER COLUMN "eventId" SET NOT NULL;
