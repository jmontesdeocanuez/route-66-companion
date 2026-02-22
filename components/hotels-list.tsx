"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { Hotel, HotelCard } from "@/components/hotel-card";
import { HotelFormDialog } from "@/components/hotel-form-dialog";

const PEOPLE_COUNT = 7;

interface HotelsListProps {
  hotels: Hotel[];
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function HotelsList({ hotels }: HotelsListProps) {
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const upcomingHotels = hotels.filter((h) => addDays(h.checkIn, h.nights) > today);
  const pastHotels = hotels.filter((h) => addDays(h.checkIn, h.nights) <= today);

  const hotelsWithFee = hotels.filter((h) => h.resortFee);
  const totalUsd = hotelsWithFee.reduce(
    (sum, h) => sum + h.resortFee!.pricePerRoomPerNight * h.rooms * h.nights,
    0
  );
  const perPerson = Math.ceil(totalUsd / PEOPLE_COUNT);

  function refresh() {
    router.refresh();
  }

  function editTrigger(hotel: Hotel) {
    return (
      <HotelFormDialog
        hotel={hotel}
        trigger={
          <Button variant="ghost" size="icon-sm" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <Pencil className="size-4" />
          </Button>
        }
        onSuccess={refresh}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{hotels.length} hoteles</p>
        <HotelFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Añadir hotel
            </Button>
          }
          onSuccess={refresh}
        />
      </div>

      <div className="space-y-4">
        {upcomingHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} editTrigger={editTrigger(hotel)} />
        ))}
      </div>

      {pastHotels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Anteriores
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {pastHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} editTrigger={editTrigger(hotel)} past />
          ))}
        </div>
      )}

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
  );
}
