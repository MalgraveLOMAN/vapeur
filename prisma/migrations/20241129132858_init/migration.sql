/*
  Warnings:

  - You are about to drop the `TypeEnum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `Type` table. All the data in the column will be lost.
  - Added the required column `type` to the `Type` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TypeEnum_type_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TypeEnum";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Type" ("description", "id") SELECT "description", "id" FROM "Type";
DROP TABLE "Type";
ALTER TABLE "new_Type" RENAME TO "Type";
CREATE UNIQUE INDEX "Type_type_key" ON "Type"("type");
CREATE UNIQUE INDEX "Type_description_key" ON "Type"("description");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
