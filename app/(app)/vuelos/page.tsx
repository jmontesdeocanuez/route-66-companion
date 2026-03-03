import { prisma } from "@/lib/prisma";
import { FlightsList } from "@/components/flights-list";

export const metadata = {
  title: "Vuelos — Route 66 Companion",
};

export default async function VuelosPage() {
  const dbFlights = await prisma.flight.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const flights = dbFlights.map((f) => ({
    id: f.id,
    airline: f.airline,
    flightNumber: f.flightNumber,
    flightIata: f.flightIata,
    originCode: f.originCode,
    originCity: f.originCity,
    originCountry: f.originCountry,
    destinationCode: f.destinationCode,
    destinationCity: f.destinationCity,
    destinationCountry: f.destinationCountry,
    departureDate: f.departureDate,
    departureTime: f.departureTime,
    arrivalDate: f.arrivalDate,
    arrivalTime: f.arrivalTime,
    duration: f.duration,
    cabinClass: f.cabinClass,
    passengers: f.passengers,
    sortOrder: f.sortOrder,
  }));

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Vuelos</h1>
          <p className="text-muted-foreground">
            Vuelos reservados para el viaje a la Ruta 66
          </p>
        </div>

        <FlightsList flights={flights} />
      </div>
    </main>
  );
}
