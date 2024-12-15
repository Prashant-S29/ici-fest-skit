/*
  Warnings:

  - Changed the type of `branch` on the `EventCoordinator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CSE', 'CSE_AI', 'CSE_DS', 'CSE_IOT', 'IT', 'ECE', 'CE', 'EE', 'ME');

-- AlterTable
ALTER TABLE "EventCoordinator" DROP COLUMN "branch",
ADD COLUMN     "branch" "Branch" NOT NULL;
