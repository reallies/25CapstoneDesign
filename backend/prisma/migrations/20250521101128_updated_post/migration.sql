-- AlterTable
ALTER TABLE "DayPlace" ADD COLUMN     "dayplace_time" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "image_urls" JSONB,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "visibility" "TripVisibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
