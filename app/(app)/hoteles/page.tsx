import { Hotel, HotelCard } from "@/components/hotel-card";

export const metadata = {
  title: "Hoteles — Route 66 Companion",
};

const hotels: Hotel[] = [
  {
    id: "1",
    name: "The Buckingham Athletic Club Hotel",
    city: "Chicago",
    state: "Illinois",
    address: "440 S LaSalle St, Chicago, IL 60605",
    category: 4,
    checkIn: "2026-06-21",
    checkOut: "2026-06-22",
    roomType: "Habitación Doble Deluxe",
    pricePerNight: 189,
    amenities: ["WiFi", "Gimnasio", "Restaurante", "Bar", "Aparcamiento"],
    confirmationCode: "BKG-001234",
    phone: "+1 (312) 555-0100",
  },
  {
    id: "2",
    name: "Blue Swallow Motel",
    city: "Tucumcari",
    state: "Nuevo México",
    address: "815 E Route 66 Blvd, Tucumcari, NM 88401",
    category: 2,
    checkIn: "2026-06-25",
    checkOut: "2026-06-27",
    roomType: "Habitación Clásica Vintage",
    pricePerNight: 85,
    amenities: ["WiFi", "Parking gratuito", "Garaje cubierto"],
    confirmationCode: "BSW-005678",
    phone: "+1 (575) 555-0200",
  },
  {
    id: "3",
    name: "La Posada Hotel",
    city: "Winslow",
    state: "Arizona",
    address: "303 E 2nd St, Winslow, AZ 86047",
    category: 4,
    checkIn: "2026-06-28",
    checkOut: "2026-06-30",
    roomType: "Suite Suroeste",
    pricePerNight: 220,
    amenities: ["WiFi", "Restaurante", "Jardines históricos", "Bar", "Galería de arte"],
    confirmationCode: "LPH-009012",
    phone: "+1 (928) 555-0300",
  },
  {
    id: "4",
    name: "Wigwam Motel",
    city: "Holbrook",
    state: "Arizona",
    address: "811 W Hopi Dr, Holbrook, AZ 86025",
    category: 2,
    checkIn: "2026-07-01",
    checkOut: "2026-07-02",
    roomType: "Wigwam Clásico",
    pricePerNight: 95,
    amenities: ["Parking gratuito", "Piscina exterior", "WiFi"],
    confirmationCode: "WGM-003456",
    phone: "+1 (928) 555-0400",
  },
  {
    id: "5",
    name: "Shutters on the Beach",
    city: "Santa Mónica",
    state: "California",
    address: "1 Pico Blvd, Santa Monica, CA 90405",
    category: 5,
    checkIn: "2026-07-04",
    checkOut: "2026-07-07",
    roomType: "Ocean View Suite",
    pricePerNight: 650,
    amenities: ["WiFi", "Spa", "Piscina", "Restaurante", "Vista al océano", "Concierge 24h"],
    confirmationCode: "SOB-007890",
    phone: "+1 (310) 555-0500",
  },
];

export default function HotelesPage() {
  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Hoteles</h1>
          <p className="text-muted-foreground">
            Alojamientos reservados a lo largo de la Ruta 66
          </p>
        </div>

        <div className="space-y-4">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>
    </main>
  );
}
