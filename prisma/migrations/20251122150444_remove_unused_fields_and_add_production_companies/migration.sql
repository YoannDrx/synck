/*
  Warnings:

  - You are about to drop the column `duration` on the `Work` table. All the data in the column will be lost.
  - You are about to drop the column `isrcCode` on the `Work` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Work" DROP COLUMN "duration",
DROP COLUMN "isrcCode",
ADD COLUMN     "productionCompanySlugs" JSONB;
