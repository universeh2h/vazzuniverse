/*
  Warnings:

  - You are about to drop the column `serverId` on the `kategoris` table. All the data in the column will be lost.
  - Added the required column `server_id` to the `kategoris` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `kategoris` DROP COLUMN `serverId`,
    ADD COLUMN `server_id` INTEGER NOT NULL;
