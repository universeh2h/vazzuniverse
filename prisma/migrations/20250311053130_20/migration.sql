-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `top_up_message` VARCHAR(191) NULL,
    ADD COLUMN `top_up_processed_at` DATETIME(3) NULL,
    ADD COLUMN `top_up_reference` VARCHAR(191) NULL,
    ADD COLUMN `top_up_status` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `transactions_top_up_status_idx` ON `transactions`(`top_up_status`);
