-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER');

-- CreateEnum
CREATE TYPE "TripVisibility" AS ENUM ('PRIVATE', 'FRIENDS_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "CompanionType" AS ENUM ('SOLO', 'COUPLE', 'FRIENDS', 'SPOUSE', 'FAMILY', 'SIBLINGS', 'COLLEAGUES', 'PET', 'HOBBY_GROUP', 'OTHER');

-- CreateEnum
CREATE TYPE "ThemeType" AS ENUM ('ADVENTURE', 'SNS_HOTSPOT', 'LANDMARK', 'CULTURE_HISTORY', 'FESTIVAL_EVENT', 'NATURE', 'SHOPPING', 'HEALING', 'FOOD_TOUR');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'TICKET', 'OTHER', 'ACTIVITY', 'SHOPPING');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "provider_id" VARCHAR(255) NOT NULL,
    "nickname" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "trip_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_shared" "TripVisibility" NOT NULL DEFAULT 'PRIVATE',
    "companion_type" "CompanionType"[],
    "destinations" TEXT[],
    "theme" "ThemeType"[],
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "Day" (
    "day_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "day_order" INTEGER NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("day_id")
);

-- CreateTable
CREATE TABLE "DayPlace" (
    "dayplace_id" SERIAL NOT NULL,
    "day_id" INTEGER NOT NULL,
    "place_id" INTEGER NOT NULL,
    "dayplace_order" INTEGER NOT NULL,

    CONSTRAINT "DayPlace_pkey" PRIMARY KEY ("dayplace_id")
);

-- CreateTable
CREATE TABLE "Place" (
    "place_id" SERIAL NOT NULL,
    "place_name" TEXT NOT NULL,
    "place_address" TEXT,
    "place_latitude" DOUBLE PRECISION NOT NULL,
    "place_longitude" DOUBLE PRECISION NOT NULL,
    "place_image_url" TEXT,
    "place_star" DOUBLE PRECISION,
    "place_call_num" TEXT,
    "review_count" INTEGER DEFAULT 0,
    "kakao_place_id" TEXT NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "expense_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day_id" INTEGER,
    "place_id" INTEGER,
    "type" "ExpenseType" NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("expense_id")
);

-- CreateTable
CREATE TABLE "Like" (
    "like_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("like_id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "Checklist" (
    "checklist_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Checklist_pkey" PRIMARY KEY ("checklist_id")
);

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
CREATE UNIQUE INDEX "User_provider_id_key" ON "User"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_trip_id_key" ON "Trip"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "Place_kakao_place_id_key" ON "Place"("kakao_place_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requester_id_recipient_id_key" ON "Friendship"("requester_id", "recipient_id");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlace" ADD CONSTRAINT "DayPlace_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "Day"("day_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlace" ADD CONSTRAINT "DayPlace_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "Day"("day_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripInvitation" ADD CONSTRAINT "TripInvitation_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripInvitation" ADD CONSTRAINT "TripInvitation_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
