/*
  Warnings:

  - You are about to drop the column `sub_kategori_id` on the `layanans` table. All the data in the column will be lost.
  - You are about to drop the `Methods` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sub_category_id` to the `layanans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `layanans` DROP COLUMN `sub_kategori_id`,
    ADD COLUMN `sub_category_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Methods`;

-- CreateTable
CREATE TABLE `methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `images` VARCHAR(191) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
