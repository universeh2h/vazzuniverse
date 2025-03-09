/*
  Warnings:

  - You are about to drop the column `profitPlatinum` on the `layanans` table. All the data in the column will be lost.
  - Added the required column `profit_platinum` to the `layanans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `layanans` DROP COLUMN `profitPlatinum`,
    ADD COLUMN `profit_platinum` INTEGER NOT NULL;
