-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_user_id_fkey`;

-- AlterTable
ALTER TABLE `invoices` MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
