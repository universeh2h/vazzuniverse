/*
  Warnings:

  - You are about to drop the column `profitReseller` on the `layanans` table. All the data in the column will be lost.
  - Added the required column `profit_reseller` to the `layanans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `layanans` DROP COLUMN `profitReseller`,
    ADD COLUMN `profit_reseller` INTEGER NOT NULL;
