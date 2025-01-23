/*
  Warnings:

  - Added the required column `contact_number` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "contact_number" TEXT NOT NULL;
