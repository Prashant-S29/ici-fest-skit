/*
  Warnings:

  - Added the required column `registrationStatus` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('UPCOMING', 'OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "EventCoordinator" DROP CONSTRAINT "EventCoordinator_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventRegistrationForm" DROP CONSTRAINT "EventRegistrationForm_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventSchedule" DROP CONSTRAINT "EventSchedule_eventId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL,
ADD COLUMN     "whatsappGroupURL" TEXT;

-- AddForeignKey
ALTER TABLE "EventRegistrationForm" ADD CONSTRAINT "EventRegistrationForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCoordinator" ADD CONSTRAINT "EventCoordinator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchedule" ADD CONSTRAINT "EventSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
