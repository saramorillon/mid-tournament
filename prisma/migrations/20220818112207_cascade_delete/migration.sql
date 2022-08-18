-- DropForeignKey
ALTER TABLE `participation` DROP FOREIGN KEY `participation_tournamentId_fkey`;

-- DropForeignKey
ALTER TABLE `participation` DROP FOREIGN KEY `participation_userId_fkey`;

-- AddForeignKey
ALTER TABLE `participation` ADD CONSTRAINT `participation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participation` ADD CONSTRAINT `participation_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
