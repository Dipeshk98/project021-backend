/*
  Warnings:

  - You are about to drop the column `displayName1` on the `teams` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "displayName1",
ADD COLUMN     "displayName" TEXT NOT NULL;
