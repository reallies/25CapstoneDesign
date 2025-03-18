/*
  Warnings:

  - Added the required column `user_id` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "user_id" INTEGER NOT NULL;
