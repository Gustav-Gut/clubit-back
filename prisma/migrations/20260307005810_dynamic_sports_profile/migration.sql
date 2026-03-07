/*
  Warnings:

  - You are about to drop the column `dominantFoot` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "dominantFoot",
DROP COLUMN "position",
ADD COLUMN     "sportData" JSONB;

-- CreateTable
CREATE TABLE "Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultFields" JSONB NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolSport" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sportId" TEXT NOT NULL,
    "customFields" JSONB,

    CONSTRAINT "SchoolSport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sport_name_key" ON "Sport"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolSport_schoolId_sportId_key" ON "SchoolSport"("schoolId", "sportId");

-- AddForeignKey
ALTER TABLE "SchoolSport" ADD CONSTRAINT "SchoolSport_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolSport" ADD CONSTRAINT "SchoolSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
