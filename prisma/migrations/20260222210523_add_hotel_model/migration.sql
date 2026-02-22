-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "boardPlan" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "resortFeePerRoomPerNight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);
