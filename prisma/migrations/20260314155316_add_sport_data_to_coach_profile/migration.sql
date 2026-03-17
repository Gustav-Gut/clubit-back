-- AlterTable
ALTER TABLE "CoachProfile" ADD COLUMN     "sportData" JSONB;

-- AlterTable
ALTER TABLE "SchoolSport" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
