/*
  Warnings:

  - You are about to drop the column `user` on the `participation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tournamentId,userId]` on the table `participation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `participation` table without a default value. This is not possible if the table is not empty.

*/

ALTER TABLE `participation` DROP CONSTRAINT `participation_tournamentId_fkey`;

-- DropIndex
DROP INDEX `participation_tournamentId_user_key` ON `participation`;

-- AlterTable
ALTER TABLE `participation` DROP COLUMN `user`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `participation_tournamentId_userId_key` ON `participation`(`tournamentId`, `userId`);

-- AddForeignKey
ALTER TABLE `participation` ADD CONSTRAINT `participation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `participation` ADD CONSTRAINT `participation_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
