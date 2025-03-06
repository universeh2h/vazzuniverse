-- CreateTable
CREATE TABLE `kategoris` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sub_name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(191) NULL,
    `serverId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `petunjuk` VARCHAR(191) NULL,
    `ket_layanan` VARCHAR(191) NULL,
    `ket_id` VARCHAR(191) NULL,
    `placeholder_1` VARCHAR(191) NOT NULL,
    `placeholder_2` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `banner_layanan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
