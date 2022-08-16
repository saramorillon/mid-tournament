-- CreateTable
CREATE TABLE "tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME NOT NULL,
    "running" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "participation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    CONSTRAINT "participation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
