/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `TypeEnum` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TypeEnum_type_key" ON "TypeEnum"("type");
