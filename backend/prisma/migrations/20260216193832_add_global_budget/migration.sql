-- CreateTable
CREATE TABLE "GlobalBudget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total" REAL NOT NULL DEFAULT 0,
    "allocated" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
