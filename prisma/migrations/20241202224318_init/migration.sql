/*
  Warnings:

  - Added the required column `description` to the `Editor` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Editor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Editor" ("id", "name") SELECT "id", "name" FROM "Editor";
DROP TABLE "Editor";
ALTER TABLE "new_Editor" RENAME TO "Editor";
CREATE UNIQUE INDEX "Editor_name_key" ON "Editor"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
