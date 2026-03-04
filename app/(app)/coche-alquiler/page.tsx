import { prisma } from "@/lib/prisma";
import { RentalCarClient } from "@/components/rental-car-client";

export const metadata = {
  title: "Coche de alquiler — Route 66 Companion",
};

export default async function CocheAlquilerPage() {
  const car = await prisma.rentalCar.findFirst({
    orderBy: { createdAt: "asc" },
    include: { refills: { orderBy: { date: "asc" } } },
  });

  const carData = car
    ? {
        id: car.id,
        licensePlate: car.licensePlate,
        model: car.model,
        imageUrl: car.imageUrl,
        pickupKm: car.pickupKm,
        returnKm: car.returnKm,
        refills: car.refills.map((r) => ({
          id: r.id,
          date: r.date,
          location: r.location,
          dollars: r.dollars,
          pricePerLiter: r.pricePerLiter,
          km: r.km,
        })),
      }
    : null;

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Coche de alquiler</h1>
          <p className="text-muted-foreground">
            Control del vehículo y registro de repostajes
          </p>
        </div>

        <RentalCarClient car={carData} />
      </div>
    </main>
  );
}
