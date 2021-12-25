/*
  Warnings:

  - Added the required column `gameType` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" INTEGER NOT NULL,
    "isFull" BOOLEAN NOT NULL,
    "gameType" TEXT NOT NULL
);
INSERT INTO "new_Room" ("code", "createdAt", "hostId", "id", "isFull", "updatedAt") SELECT "code", "createdAt", "hostId", "id", "isFull", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
