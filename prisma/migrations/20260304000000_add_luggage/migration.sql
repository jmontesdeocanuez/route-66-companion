-- CreateTable
CREATE TABLE "LuggageItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuggageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLuggageItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "luggageItemId" TEXT,
    "status" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLuggageItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserLuggageItem_userId_idx" ON "UserLuggageItem"("userId");

-- CreateIndex
CREATE INDEX "UserLuggageItem_userId_status_idx" ON "UserLuggageItem"("userId", "status");

-- AddForeignKey
ALTER TABLE "UserLuggageItem" ADD CONSTRAINT "UserLuggageItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLuggageItem" ADD CONSTRAINT "UserLuggageItem_luggageItemId_fkey" FOREIGN KEY ("luggageItemId") REFERENCES "LuggageItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
