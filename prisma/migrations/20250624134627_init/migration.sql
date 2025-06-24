-- CreateTable
CREATE TABLE "File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "extention" TEXT NOT NULL,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccess" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "File_publicKey_key" ON "File"("publicKey");
