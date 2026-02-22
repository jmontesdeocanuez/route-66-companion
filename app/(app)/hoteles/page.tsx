import { prisma } from "@/lib/prisma";
import { HotelsList } from "@/components/hotels-list";

export const metadata = {
  title: "Hoteles — Route 66 Companion",
};

export default async function HotelesPage() {
  const dbHotels = await prisma.hotel.findMany({ orderBy: { checkIn: "asc" } });

  const hotels = dbHotels.map((h) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    boardPlan: h.boardPlan,
    rooms: h.rooms,
    roomType: h.roomType,
    checkIn: h.checkIn.toISOString().slice(0, 10),
    nights: h.nights,
    imageUrl: h.imageUrl ?? undefined,
    resortFee: h.resortFeePerRoomPerNight
      ? { appliesAt: "property" as const, pricePerRoomPerNight: h.resortFeePerRoomPerNight }
      : undefined,
  }));

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Hoteles</h1>
          <p className="text-muted-foreground">
            Alojamientos reservados a lo largo de la Ruta 66
          </p>
        </div>

        <HotelsList hotels={hotels} />
      </div>
    </main>
  );
}
