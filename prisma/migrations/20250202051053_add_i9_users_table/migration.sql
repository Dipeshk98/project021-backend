-- DropForeignKey
ALTER TABLE "i9_forms" DROP CONSTRAINT "i9_forms_user_id_fkey";

-- DropIndex
DROP INDEX "i9_forms_user_id_key";

-- CreateTable
CREATE TABLE "i9_users" (
    "user_id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "i9_users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "i9_users_email_key" ON "i9_users"("email");

-- AddForeignKey
ALTER TABLE "i9_forms" ADD CONSTRAINT "i9_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "i9_users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
