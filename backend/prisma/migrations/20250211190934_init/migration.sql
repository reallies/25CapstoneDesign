-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'KAKAO', 'NAVER');

-- CreateEnum
CREATE TYPE "TripVisibility" AS ENUM ('PRIVATE', 'FRIENDS_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('FOOD', 'TRANSPORT', 'ACCOMMODATION', 'TICKET', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "provider_id" VARCHAR(255) NOT NULL,
    "nickname" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "trip_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_shared" "TripVisibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "Day" (
    "day_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("day_id")
);

-- CreateTable
CREATE TABLE "DayPlace" (
    "day_id" INTEGER NOT NULL,
    "place_id" TEXT NOT NULL,

    CONSTRAINT "DayPlace_pkey" PRIMARY KEY ("day_id","place_id")
);

-- CreateTable
CREATE TABLE "Place" (
    "place_id" TEXT NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "place_name" TEXT NOT NULL,
    "place_address" TEXT,
    "place_latitude" DOUBLE PRECISION NOT NULL,
    "place_longitude" DOUBLE PRECISION NOT NULL,
    "place_image_url" TEXT,
    "place_star" DOUBLE PRECISION,
    "place_call_num" TEXT,
    "review_count" INTEGER DEFAULT 0,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "expense_id" SERIAL NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day_id" INTEGER,
    "place_id" TEXT,
    "type" "ExpenseType" NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_id_key" ON "User"("provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "Place_google_place_id_key" ON "Place"("google_place_id");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlace" ADD CONSTRAINT "DayPlace_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "Day"("day_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlace" ADD CONSTRAINT "DayPlace_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "Day"("day_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "place_id" FOREIGN KEY ("place_id") REFERENCES "Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "Trip"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
