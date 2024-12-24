/*
  Warnings:

  - You are about to drop the column `info` on the `EventSchedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventSchedule" DROP COLUMN "info";

-- CreateTable
CREATE TABLE "CoordinatorManagedData" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "whatsappGroupURL" TEXT NOT NULL,
    "brochure" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "images" TEXT[],
    "judgementCriteria" TEXT,
    "disqualificationCriteria" TEXT,
    "materialsProvided" TEXT,

    CONSTRAINT "CoordinatorManagedData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoordinatorManagedData_eventId_key" ON "CoordinatorManagedData"("eventId");

-- AddForeignKey
ALTER TABLE "CoordinatorManagedData" ADD CONSTRAINT "CoordinatorManagedData_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
