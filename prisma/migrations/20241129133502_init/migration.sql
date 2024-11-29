-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Type" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Type" ("description", "id", "type") SELECT "description", "id", "type" FROM "Type";
DROP TABLE "Type";
ALTER TABLE "new_Type" RENAME TO "Type";
CREATE UNIQUE INDEX "Type_type_key" ON "Type"("type");
CREATE UNIQUE INDEX "Type_description_key" ON "Type"("description");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
