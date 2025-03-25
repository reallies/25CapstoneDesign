/*
  Warnings:

  - A unique constraint covering the columns `[trip_id]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nickname]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanionType" AS ENUM ('SOLO', 'COUPLE', 'FRIENDS', 'SPOUSE', 'FAMILY', 'SIBLINGS', 'COLLEAGUES', 'PET', 'HOBBY_GROUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ThemeType" AS ENUM ('ADVENTURE', 'SNS_HOTSPOT', 'LANDMARK', 'CULTURE_HISTORY', 'FESTIVAL_EVENT', 'NATURE', 'SHOPPING', 'HEALING', 'FOOD_TOUR');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpenseType" ADD VALUE 'ACTIVITY';
ALTER TYPE "ExpenseType" ADD VALUE 'SHOPPING';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "companion_type" "CompanionType"[],
ADD COLUMN     "destinations" TEXT[],
ADD COLUMN     "theme" "ThemeType"[],
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripInvitation" (
    "invitation_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "invited_user_id" INTEGER NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "permission" TEXT NOT NULL DEFAULT 'editor',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripInvitation_pkey" PRIMARY KEY ("invitation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requester_id_recipient_id_key" ON "Friendship"("requester_id", "recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_trip_id_key" ON "Trip"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripInvitation" ADD CONSTRAINT "TripInvitation_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripInvitation" ADD CONSTRAINT "TripInvitation_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
