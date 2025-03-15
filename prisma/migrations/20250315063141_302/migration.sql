/*
  Warnings:

  - Added the required column `userId` to the `deposits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `deposits` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `deposits` ADD CONSTRAINT `deposits_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
