/*
  Warnings:

  - You are about to drop the column `profileImageUrl` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the `FaceImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FaceImage" DROP CONSTRAINT "FaceImage_personId_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "profileImageUrl",
ADD COLUMN     "profileImageUrls" TEXT[],
ADD COLUMN     "vectorUrl" TEXT;

-- DropTable
DROP TABLE "FaceImage";
