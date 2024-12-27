/*
  Warnings:

  - You are about to drop the column `reviewRequestStatus` on the `CoordinatorManagedData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CoordinatorManagedData" DROP COLUMN "reviewRequestStatus";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reviewRequestStatus" "ReviewRequestStatus" NOT NULL DEFAULT 'NONE';
