/*
  Warnings:

  - A unique constraint covering the columns `[tournamentId,user]` on the table `participation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participation_tournamentId_user_key" ON "participation"("tournamentId", "user");
