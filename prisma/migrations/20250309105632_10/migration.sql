/*
  Warnings:

  - Added the required column `harga_gold` to the `layanans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit_gold` to the `layanans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `layanans` ADD COLUMN `harga_gold` INTEGER NOT NULL,
    ADD COLUMN `profit_gold` INTEGER NOT NULL;
