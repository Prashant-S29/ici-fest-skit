/*
  Warnings:

  - You are about to drop the column `eventId` on the `CoordinatorManagedData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventSlug]` on the table `CoordinatorManagedData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventSlug` to the `CoordinatorManagedData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CoordinatorManagedData" DROP CONSTRAINT "CoordinatorManagedData_eventId_fkey";

-- DropIndex
DROP INDEX "CoordinatorManagedData_eventId_key";

-- AlterTable
ALTER TABLE "CoordinatorManagedData" DROP COLUMN "eventId",
ADD COLUMN     "eventSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CoordinatorManagedData_eventSlug_key" ON "CoordinatorManagedData"("eventSlug");

-- AddForeignKey
ALTER TABLE "CoordinatorManagedData" ADD CONSTRAINT "CoordinatorManagedData_eventSlug_fkey" FOREIGN KEY ("eventSlug") REFERENCES "Event"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
