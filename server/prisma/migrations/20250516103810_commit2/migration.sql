/*
  Warnings:

  - You are about to drop the column `vector` on the `FaceImage` table. All the data in the column will be lost.
  - Added the required column `vectorUrl` to the `FaceImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FaceImage" DROP COLUMN "vector",
ADD COLUMN     "vectorUrl" TEXT NOT NULL;
