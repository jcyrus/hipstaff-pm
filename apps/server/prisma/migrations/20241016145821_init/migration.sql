/*
  Warnings:

  - You are about to drop the column `name` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "projectManagerUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
