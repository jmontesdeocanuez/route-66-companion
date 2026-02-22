-- CreateTable
CREATE TABLE "TripConfig" (
    "key" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripConfig_pkey" PRIMARY KEY ("key")
);
