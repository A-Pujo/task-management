-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_taskId_fkey`;

-- DropIndex
DROP INDEX `Log_taskId_fkey` ON `Log`;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
