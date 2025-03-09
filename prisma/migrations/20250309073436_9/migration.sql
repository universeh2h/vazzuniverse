/*
  Warnings:

  - You are about to alter the column `sub_kategori_id` on the `layanans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `harga` on the `layanans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `harga_reseller` on the `layanans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `harga_platinum` on the `layanans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `harga_flash_sale` on the `layanans` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to drop the `methods` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `layanans` MODIFY `sub_kategori_id` INTEGER NOT NULL,
    MODIFY `harga` INTEGER NOT NULL,
    MODIFY `harga_reseller` INTEGER NOT NULL,
    MODIFY `harga_platinum` INTEGER NOT NULL,
    MODIFY `harga_flash_sale` INTEGER NULL DEFAULT 0;

-- DropTable
DROP TABLE `methods`;

-- CreateTable
CREATE TABLE `Methods` (
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
