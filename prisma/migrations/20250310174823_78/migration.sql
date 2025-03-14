-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `merchant_order_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `layanan_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `original_amount` DOUBLE NOT NULL,
    `discount_amount` DOUBLE NOT NULL DEFAULT 0,
    `final_amount` DOUBLE NOT NULL,
    `voucher_id` INTEGER NULL,
    `payment_status` VARCHAR(191) NOT NULL,
    `payment_code` VARCHAR(191) NOT NULL,
    `payment_reference` VARCHAR(191) NULL,
    `payment_url` VARCHAR(191) NULL,
    `no_wa` VARCHAR(191) NOT NULL,
    `status_message` VARCHAR(191) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `transactions_merchant_order_id_key`(`merchant_order_id`),
    INDEX `transactions_merchant_order_id_idx`(`merchant_order_id`),
    INDEX `transactions_user_id_idx`(`user_id`),
    INDEX `transactions_payment_status_idx`(`payment_status`),
    INDEX `transactions_voucher_id_idx`(`voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_layanan_id_fkey` FOREIGN KEY (`layanan_id`) REFERENCES `layanans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `kategoris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
