/*
  Warnings:

  - You are about to drop the column `is_international` on the `traveling_expenses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "expense_comments" DROP CONSTRAINT "expense_comments_traveling_expense_id_fkey";

-- DropForeignKey
ALTER TABLE "expense_items" DROP CONSTRAINT "expense_items_traveling_expense_id_fkey";

-- AlterTable
ALTER TABLE "expense_items" ADD COLUMN     "distance" DECIMAL(10,2),
ADD COLUMN     "is_international" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "traveling_expenses" DROP COLUMN "is_international";

-- AddForeignKey
ALTER TABLE "expense_items" ADD CONSTRAINT "expense_items_traveling_expense_id_fkey" FOREIGN KEY ("traveling_expense_id") REFERENCES "traveling_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_comments" ADD CONSTRAINT "expense_comments_traveling_expense_id_fkey" FOREIGN KEY ("traveling_expense_id") REFERENCES "traveling_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
