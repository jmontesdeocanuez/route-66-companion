import { Flight, FlightCard } from "@/components/flight-card";

export const metadata = {
  title: "Vuelos — Route 66 Companion",
};

const flights: Flight[] = [
  {
    id: "1",
    airline: "Binter Canarias",
    flightNumber: "NT 102",
    originCode: "LPA",
    originCity: "Las Palmas de Gran Canaria",
    originCountry: "España",
    destinationCode: "MAD",
    destinationCity: "Madrid",
    destinationCountry: "España",
    departureDate: "2026-06-19",
    departureTime: "07:30",
    arrivalDate: "2026-06-19",
    arrivalTime: "10:45",
    duration: "3h 15m",
    cabinClass: "Turista",
    passengers: 2,
    confirmationCode: "BNT-112233",
    pricePerPerson: 189,
  },
  {
    id: "2",
    airline: "Iberia",
    flightNumber: "IB 6251",
    originCode: "MAD",
    originCity: "Madrid",
    originCountry: "España",
    destinationCode: "ORD",
    destinationCity: "Chicago",
    destinationCountry: "Estados Unidos",
    departureDate: "2026-06-20",
    departureTime: "13:15",
    arrivalDate: "2026-06-20",
    arrivalTime: "17:05",
    duration: "9h 50m",
    cabinClass: "Business",
    passengers: 2,
    confirmationCode: "IBE-445566",
    pricePerPerson: 1240,
  },
  {
    id: "3",
    airline: "American Airlines",
    flightNumber: "AA 238",
    originCode: "LAX",
    originCity: "Los Ángeles",
    originCountry: "Estados Unidos",
    destinationCode: "MAD",
    destinationCity: "Madrid",
    destinationCountry: "España",
    departureDate: "2026-07-09",
    departureTime: "18:30",
    arrivalDate: "2026-07-10",
    arrivalTime: "14:55",
    duration: "11h 25m",
    cabinClass: "Turista Premium",
    passengers: 2,
    confirmationCode: "AAL-778899",
    pricePerPerson: 890,
  },
  {
    id: "4",
    airline: "Iberia",
    flightNumber: "IB 6830",
    originCode: "MAD",
    originCity: "Madrid",
    originCountry: "España",
    destinationCode: "LPA",
    destinationCity: "Las Palmas de Gran Canaria",
    destinationCountry: "España",
    departureDate: "2026-07-12",
    departureTime: "20:00",
    arrivalDate: "2026-07-12",
    arrivalTime: "23:20",
    duration: "3h 20m",
    cabinClass: "Turista",
    passengers: 2,
    confirmationCode: "IBE-001122",
    pricePerPerson: 210,
  },
];

export default function VuelosPage() {
  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Vuelos</h1>
          <p className="text-muted-foreground">
            Vuelos reservados para el viaje a la Ruta 66
          </p>
        </div>

        <div className="space-y-4">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      </div>
    </main>
  );
}
