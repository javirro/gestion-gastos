-- CreateEnum
CREATE TYPE "TravelingExpenseStatus" AS ENUM ('PENDING', 'APPROVED_BY_MANAGER', 'APPROVED_BY_ADMIN', 'CORRECTION_REQUESTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRANSPORTE', 'DIETAS', 'COMISIONES', 'COMBUSTIBLE');

-- CreateTable
CREATE TABLE "traveling_expenses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project" TEXT,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "approved_by" UUID,
    "approved_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_international" BOOLEAN NOT NULL DEFAULT false,
    "status" "TravelingExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "correction_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traveling_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_items" (
    "id" UUID NOT NULL,
    "traveling_expense_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "starting_location" TEXT,
    "destination" TEXT,
    "description" TEXT,
    "string" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "traveling_expenses_user_id_idx" ON "traveling_expenses"("user_id");

-- CreateIndex
CREATE INDEX "expense_items_traveling_expense_id_idx" ON "expense_items"("traveling_expense_id");

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_traveling_expense_id_fkey" FOREIGN KEY ("traveling_expense_id") REFERENCES "traveling_expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
