/*
  Warnings:

  - You are about to drop the column `isActive` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isActive",
DROP COLUMN "status";