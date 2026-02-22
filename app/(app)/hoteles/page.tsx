import { HotelCard } from "@/components/hotel-card";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";

export const metadata = {
  title: "Hoteles — Route 66 Companion",
};

const PEOPLE_COUNT = 7;

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

  const hotelsWithFee = hotels.filter((h) => h.resortFee);
  const totalUsd = hotelsWithFee.reduce(
    (sum, h) => sum + h.resortFee!.pricePerRoomPerNight * h.rooms * h.nights,
    0
  );
  const perPerson = Math.ceil(totalUsd / PEOPLE_COUNT);

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

        {hotelsWithFee.length > 0 && (
          <Card className="overflow-hidden p-0 gap-0">
            <div className="flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800">
              <TriangleAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <h2 className="font-semibold text-amber-800 dark:text-amber-300">
                Resort fees — pago en hotel
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {hotelsWithFee.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{h.city}</span>
                    <span className="text-muted-foreground ml-2">
                      ${h.resortFee!.pricePerRoomPerNight}/hab·noche × {h.rooms} hab × {h.nights}{" "}
                      {h.nights === 1 ? "noche" : "noches"}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    ${h.resortFee!.pricePerRoomPerNight * h.rooms * h.nights}
                  </span>
                </div>
              ))}

              <div className="border-t pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-bold tabular-nums">${totalUsd}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Por persona ({PEOPLE_COUNT} personas)</span>
                  <span className="font-semibold tabular-nums text-muted-foreground">
                    ~${perPerson}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
