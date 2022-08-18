/*
  Warnings:

  - Made the column `description` on table `tournament` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `tournament` MODIFY `description` TEXT NOT NULL;
