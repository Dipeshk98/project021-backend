/*
  Warnings:

  - You are about to drop the `members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `todos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "members";

-- DropTable
DROP TABLE "teams";

-- DropTable
DROP TABLE "todos";

-- DropEnum
DROP TYPE "InvitationStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "i9_forms" (
    "form_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "form_status" VARCHAR(50) NOT NULL,
    "submission_date" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i9_forms_pkey" PRIMARY KEY ("form_id")
);

-- CreateTable
CREATE TABLE "i9_employee_section" (
    "section_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "employee_name" VARCHAR(255) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "ssn" VARCHAR(11) NOT NULL,
    "citizenship_status" VARCHAR(50) NOT NULL,
    "alien_registration_number" VARCHAR(50),
    "work_authorization_expiry" TIMESTAMP(3),
    "signature" TEXT NOT NULL,
    "signed_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i9_employee_section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "i9_employer_section" (
    "section_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "employer_name" VARCHAR(255) NOT NULL,
    "employer_address" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "signature" TEXT NOT NULL,
    "signed_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i9_employer_section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "i9_documents" (
    "document_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "document_type" VARCHAR(100) NOT NULL,
    "document_number" VARCHAR(100) NOT NULL,
    "document_expiry" TIMESTAMP(3),
    "issuing_authority" VARCHAR(255) NOT NULL,
    "uploaded_file" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "i9_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "i9_reverification" (
    "reverification_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "new_document_type" VARCHAR(100) NOT NULL,
    "new_document_number" VARCHAR(100) NOT NULL,
    "new_document_expiry" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "i9_reverification_pkey" PRIMARY KEY ("reverification_id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "audit_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("audit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "i9_forms_user_id_key" ON "i9_forms"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "i9_employee_section_form_id_key" ON "i9_employee_section"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "i9_employee_section_ssn_key" ON "i9_employee_section"("ssn");

-- CreateIndex
CREATE UNIQUE INDEX "i9_employer_section_form_id_key" ON "i9_employer_section"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "i9_reverification_form_id_key" ON "i9_reverification"("form_id");

-- AddForeignKey
ALTER TABLE "i9_forms" ADD CONSTRAINT "i9_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i9_employee_section" ADD CONSTRAINT "i9_employee_section_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "i9_forms"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i9_employer_section" ADD CONSTRAINT "i9_employer_section_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "i9_forms"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i9_documents" ADD CONSTRAINT "i9_documents_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "i9_forms"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "i9_reverification" ADD CONSTRAINT "i9_reverification_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "i9_forms"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "i9_forms"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;
