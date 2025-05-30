/*
  Warnings:

  - Added the required column `updatedAt` to the `Camera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Camera_adminId_idx" ON "Camera"("adminId");

-- CreateIndex
CREATE INDEX "DetectionLog_sessionId_idx" ON "DetectionLog"("sessionId");

-- CreateIndex
CREATE INDEX "DetectionSession_cameraId_idx" ON "DetectionSession"("cameraId");

-- CreateIndex
CREATE INDEX "Person_adminId_idx" ON "Person"("adminId");
