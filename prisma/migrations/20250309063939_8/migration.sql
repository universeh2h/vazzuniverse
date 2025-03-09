-- CreateTable
CREATE TABLE `layanans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori_id` VARCHAR(191) NOT NULL,
    `sub_kategori_id` BIGINT NOT NULL,
    `layanan` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `harga` BIGINT NOT NULL,
    `harga_reseller` BIGINT NOT NULL,
    `harga_platinum` BIGINT NOT NULL,
    `harga_flash_sale` BIGINT NULL DEFAULT 0,
    `profit` INTEGER NOT NULL,
    `profitReseller` INTEGER NOT NULL,
    `profitPlatinum` INTEGER NOT NULL,
    `is_flash_sale` BOOLEAN NOT NULL DEFAULT false,
    `judul_flash_sale` VARCHAR(191) NULL,
    `banner_flash_sale` VARCHAR(191) NULL,
    `expired_flash_sale` DATETIME(3) NULL,
    `catatan` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `product_logo` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `udpated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
