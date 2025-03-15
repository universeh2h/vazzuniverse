/*
  Warnings:

  - You are about to drop the column `top_up_message` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `top_up_processed_at` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `top_up_reference` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `top_up_status` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `transaction_type` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `transactions_top_up_status_idx` ON `transactions`;

-- AlterTable
ALTER TABLE `transactions` DROP COLUMN `top_up_message`,
    DROP COLUMN `top_up_processed_at`,
    DROP COLUMN `top_up_reference`,
    DROP COLUMN `top_up_status`,
    ADD COLUMN `transaction_type` VARCHAR(191) NOT NULL;
