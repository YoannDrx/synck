-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('ASSETS', 'WORKS', 'COMPOSERS', 'CATEGORIES', 'LABELS', 'ALL');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('JSON', 'CSV');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ExportHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ExportType" NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "entityCount" INTEGER,
    "fileSize" INTEGER,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExportHistory_userId_idx" ON "ExportHistory"("userId");

-- CreateIndex
CREATE INDEX "ExportHistory_createdAt_idx" ON "ExportHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ExportHistory_status_idx" ON "ExportHistory"("status");

-- AddForeignKey
ALTER TABLE "ExportHistory" ADD CONSTRAINT "ExportHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
