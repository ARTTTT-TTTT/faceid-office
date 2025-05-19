/*
  Warnings:

  - You are about to drop the column `profileImageUrls` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `vectorUrl` on the `Person` table. All the data in the column will be lost.
  - Added the required column `profileImageUrl` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "profileImageUrls",
DROP COLUMN "vectorUrl",
ADD COLUMN     "faceImageUrls" TEXT[],
ADD COLUMN     "profileImageUrl" TEXT NOT NULL;
