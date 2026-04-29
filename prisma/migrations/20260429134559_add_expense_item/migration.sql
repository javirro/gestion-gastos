/*
  Warnings:

  - You are about to drop the column `string` on the `expense_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expense_items" DROP COLUMN "string",
ADD COLUMN     "ticket" TEXT;
