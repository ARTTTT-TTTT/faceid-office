/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DetectionLog" DROP CONSTRAINT "DetectionLog_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_cameraId_fkey";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "DetectionSession" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "cameraId" TEXT NOT NULL,

    CONSTRAINT "DetectionSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DetectionSession" ADD CONSTRAINT "DetectionSession_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectionLog" ADD CONSTRAINT "DetectionLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DetectionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
