-- CreateEnum
CREATE TYPE "app_role" AS ENUM ('ADMINISTRACION', 'EMPLEADO', 'RESPONSABLES', 'IP', 'DIRECTIVOS');

-- CreateTable
CREATE TABLE "user_roles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "app_role" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");
