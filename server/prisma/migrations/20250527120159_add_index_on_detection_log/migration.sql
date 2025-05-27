-- AlterTable
ALTER TABLE "DetectionLog" ALTER COLUMN "cameraId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "DetectionLog_cameraId_idx" ON "DetectionLog"("cameraId");

-- CreateIndex
CREATE INDEX "DetectionLog_personId_idx" ON "DetectionLog"("personId");
