/*
  Warnings:

  - You are about to drop the column `udpated_at` on the `layanans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `layanans` DROP COLUMN `udpated_at`,
    ADD COLUMN `updated_at` DATETIME(3) NULL;
