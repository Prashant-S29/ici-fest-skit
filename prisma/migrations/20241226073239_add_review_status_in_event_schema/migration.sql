-- CreateEnum
CREATE TYPE "ReviewRequestStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "CoordinatorManagedData" ADD COLUMN     "reviewRequestStatus" "ReviewRequestStatus" NOT NULL DEFAULT 'NONE';
