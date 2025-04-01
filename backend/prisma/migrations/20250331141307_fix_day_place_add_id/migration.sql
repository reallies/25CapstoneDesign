/*
  Warnings:

  - The primary key for the `DayPlace` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DayPlace" DROP CONSTRAINT "DayPlace_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DayPlace_pkey" PRIMARY KEY ("id");
