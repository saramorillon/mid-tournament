-- CreateTable
CREATE TABLE `tournament` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NOT NULL,
    `running` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournamentId` INTEGER NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `votes` INTEGER NOT NULL,

    UNIQUE INDEX `participation_tournamentId_user_key`(`tournamentId`, `user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `participation` ADD CONSTRAINT `participation_tournamentId_fkey` FOREIGN KEY (`tournamentId`) REFERENCES `tournament`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
