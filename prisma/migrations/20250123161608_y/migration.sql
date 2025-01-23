/*
  Warnings:

  - You are about to drop the column `role1` on the `members` table. All the data in the column will be lost.
  - Added the required column `role` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "role1",
ADD COLUMN     "role" "Role" NOT NULL;
