-- CreateTable
CREATE TABLE "RentalCar" (
    "id" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "imageUrl" TEXT,
    "pickupKm" INTEGER,
    "returnKm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelRefill" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dollars" DOUBLE PRECISION NOT NULL,
    "pricePerLiter" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "km" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelRefill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FuelRefill" ADD CONSTRAINT "FuelRefill_carId_fkey" FOREIGN KEY ("carId") REFERENCES "RentalCar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
