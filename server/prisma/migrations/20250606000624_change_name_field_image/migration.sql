/*
  Warnings:

  - You are about to drop the column `faceImageUrls` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `Person` table. All the data in the column will be lost.
  - Added the required column `profileImagePath` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "faceImageUrls",
DROP COLUMN "profileImageUrl",
ADD COLUMN     "faceImagePaths" TEXT[],
ADD COLUMN     "profileImagePath" TEXT NOT NULL;
