-- AlterTable
ALTER TABLE "CallSheet" ADD COLUMN "rate" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "CallSheetPicture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callSheetId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "CallSheetPicture_callSheetId_fkey" FOREIGN KEY ("callSheetId") REFERENCES "CallSheet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
