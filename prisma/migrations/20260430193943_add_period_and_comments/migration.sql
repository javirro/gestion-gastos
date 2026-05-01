-- AlterTable
ALTER TABLE "traveling_expenses" ADD COLUMN     "period" TEXT;

-- CreateTable
CREATE TABLE "expense_comments" (
    "id" UUID NOT NULL,
    "traveling_expense_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "user_name" TEXT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_comments_traveling_expense_id_idx" ON "expense_comments"("traveling_expense_id");

-- AddForeignKey
ALTER TABLE "expense_comments" ADD CONSTRAINT "expense_comments_traveling_expense_id_fkey" FOREIGN KEY ("traveling_expense_id") REFERENCES "traveling_expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
