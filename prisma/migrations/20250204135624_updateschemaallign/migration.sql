/*
  Warnings:

  - You are about to drop the column `new_document_expiry` on the `i9_reverification` table. All the data in the column will be lost.
  - You are about to drop the column `new_document_number` on the `i9_reverification` table. All the data in the column will be lost.
  - You are about to drop the column `new_document_type` on the `i9_reverification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ssn]` on the table `i9_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `document_title` to the `i9_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_day_of_employment` to the `i9_employer_section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_name` to the `i9_reverification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_signature` to the `i9_reverification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employer_signed_date` to the `i9_reverification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "i9_documents" ADD COLUMN     "document_title" VARCHAR(255) NOT NULL,
ALTER COLUMN "document_number" DROP NOT NULL;

-- AlterTable
ALTER TABLE "i9_employer_section" ADD COLUMN     "first_day_of_employment" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "i9_reverification" DROP COLUMN "new_document_expiry",
DROP COLUMN "new_document_number",
DROP COLUMN "new_document_type",
ADD COLUMN     "additional_information" TEXT,
ADD COLUMN     "employer_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "employer_signature" TEXT NOT NULL,
ADD COLUMN     "employer_signed_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "new_first_name" VARCHAR(100),
ADD COLUMN     "new_last_name" VARCHAR(100),
ADD COLUMN     "new_middle_initial" VARCHAR(10),
ADD COLUMN     "rehire_date" TIMESTAMP(3),
ADD COLUMN     "reverification_document_expiry" TIMESTAMP(3),
ADD COLUMN     "reverification_document_number" VARCHAR(100),
ADD COLUMN     "reverification_document_title" VARCHAR(100),
ADD COLUMN     "used_dhs_alternative" BOOLEAN;

-- AlterTable
ALTER TABLE "i9_users" ADD COLUMN     "address_apt" VARCHAR(50),
ADD COLUMN     "address_street" VARCHAR(255),
ADD COLUMN     "alien_registration_number" VARCHAR(50),
ADD COLUMN     "citizenship_status" VARCHAR(50),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country_of_issuance" VARCHAR(100),
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "employee_signature" TEXT,
ADD COLUMN     "foreign_passport_number" VARCHAR(50),
ADD COLUMN     "i94_admission_number" VARCHAR(50),
ADD COLUMN     "middle_initial" VARCHAR(10),
ADD COLUMN     "other_last_names" VARCHAR(100),
ADD COLUMN     "signed_date" TIMESTAMP(3),
ADD COLUMN     "ssn" VARCHAR(11),
ADD COLUMN     "state" VARCHAR(100),
ADD COLUMN     "uscis_a_number" VARCHAR(50),
ADD COLUMN     "work_authorization_expiry" TIMESTAMP(3),
ADD COLUMN     "zip_code" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "i9_users_ssn_key" ON "i9_users"("ssn");
