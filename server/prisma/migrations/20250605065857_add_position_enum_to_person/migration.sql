/*
  Warnings:

  - The `position` column on the `Person` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[adminId,fullName]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cameraId` on table `DetectionLog` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('STUDENT', 'MANAGER', 'EMPLOYEE', 'OFFICER', 'GUEST');

-- AlterTable
ALTER TABLE "DetectionLog" ALTER COLUMN "cameraId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "position",
ADD COLUMN     "position" "Position";

-- CreateIndex
CREATE INDEX "DetectionLog_cameraId_sessionId_idx" ON "DetectionLog"("cameraId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_adminId_fullName_key" ON "Person"("adminId", "fullName");

-- AddForeignKey
ALTER TABLE "DetectionLog" ADD CONSTRAINT "DetectionLog_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
