-- CreateEnum
CREATE TYPE "Area" AS ENUM ('ADMINISTRACION', 'TECNOLOGIA', 'RECURSOS_HUMANOS', 'GESTION', 'BIOLOGIA', 'QUIMICA');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "name" TEXT,
    "area" "Area" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "users_user_id_idx" ON "users"("user_id");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");
