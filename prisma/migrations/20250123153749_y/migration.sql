/*
  Warnings:

  - You are about to drop the column `displayName` on the `teams` table. All the data in the column will be lost.
  - Added the required column `displayName1` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "displayName",
ADD COLUMN     "displayName1" TEXT NOT NULL;
