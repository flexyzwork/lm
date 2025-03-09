/*
  Warnings:

  - You are about to drop the `VideoMetadata` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoMetadata" DROP CONSTRAINT "VideoMetadata_chapterId_fkey";

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "video" TEXT;

-- DropTable
DROP TABLE "VideoMetadata";
