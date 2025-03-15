-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_layanan_id_fkey`;

-- DropIndex
DROP INDEX `transactions_category_id_fkey` ON `transactions`;

-- DropIndex
DROP INDEX `transactions_layanan_id_fkey` ON `transactions`;

-- AlterTable
ALTER TABLE `transactions` MODIFY `layanan_id` INTEGER NULL,
    MODIFY `category_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_layanan_id_fkey` FOREIGN KEY (`layanan_id`) REFERENCES `layanans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `kategoris`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
