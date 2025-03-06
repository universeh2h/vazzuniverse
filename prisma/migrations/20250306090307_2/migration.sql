/*
  Warnings:

  - You are about to drop the column `banner_layanan` on the `kategoris` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `kategoris` table. All the data in the column will be lost.
  - You are about to drop the column `sub_name` on the `kategoris` table. All the data in the column will be lost.
  - Added the required column `bannerlayanan` to the `kategoris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `kategoris` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_nama` to the `kategoris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kategoris` DROP COLUMN `banner_layanan`,
    DROP COLUMN `name`,
    DROP COLUMN `sub_name`,
    ADD COLUMN `bannerlayanan` VARCHAR(191) NOT NULL,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `sub_nama` VARCHAR(191) NOT NULL;
