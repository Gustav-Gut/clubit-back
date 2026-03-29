/*
  Warnings:

  - You are about to drop the column `sportId` on the `Lesson` table. All the data in the column will be lost.
  - Added the required column `schoolSportId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_sportId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "sportId",
ADD COLUMN     "schoolSportId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_schoolSportId_fkey" FOREIGN KEY ("schoolSportId") REFERENCES "SchoolSport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
