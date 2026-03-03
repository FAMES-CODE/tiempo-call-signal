/*
  Warnings:

  - A unique constraint covering the columns `[RECORDID]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_RECORDID_key" ON "Customer"("RECORDID");
