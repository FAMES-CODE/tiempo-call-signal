/*
  Warnings:

  - You are about to drop the column `date` on the `CallSheet` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CallSheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "problemType" TEXT,
    "problemDescription" TEXT,
    "callSim" TEXT,
    "callNumber" TEXT,
    "createdById" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "observation" TEXT,
    "resolvedAt" DATETIME,
    "resolvedById" INTEGER,
    "isSynced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CallSheet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CallSheet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CallSheet_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CallSheet" ("callNumber", "callSim", "createdAt", "createdById", "customerId", "id", "isSynced", "observation", "problemDescription", "problemType", "resolvedAt", "resolvedById", "status", "updatedAt") SELECT "callNumber", "callSim", "createdAt", "createdById", "customerId", "id", "isSynced", "observation", "problemDescription", "problemType", "resolvedAt", "resolvedById", "status", "updatedAt" FROM "CallSheet";
DROP TABLE "CallSheet";
ALTER TABLE "new_CallSheet" RENAME TO "CallSheet";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
