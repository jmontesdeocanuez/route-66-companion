import { MapPin, Calendar, BedDouble, Users, UtensilsCrossed, TriangleAlert, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface ResortFee {
  appliesAt: "property";
  pricePerRoomPerNight: number;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  boardPlan: string;
  rooms: number;
  roomType: string;
  checkIn: string;
  nights: number;
  resortFee?: ResortFee;
  imageUrl?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function HotelCard({ hotel, editTrigger, past }: { hotel: Hotel; editTrigger?: React.ReactNode; past?: boolean }) {
  const checkOut = addDays(hotel.checkIn, hotel.nights);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.city}`)}`;
  const resortFeeTotal = hotel.resortFee
    ? hotel.resortFee.pricePerRoomPerNight * hotel.rooms * hotel.nights
    : null;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Image */}
      {hotel.imageUrl && (
        <div
          className="h-80 w-full overflow-hidden"
          style={past ? { filter: "grayscale(100%)", WebkitFilter: "grayscale(100%)" } : undefined}
        >
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <h2 className="text-primary-foreground text-xl font-bold leading-tight">
          {hotel.name}
        </h2>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary-foreground/70">
            <MapPin className="size-3.5 shrink-0" />
            <span className="text-sm">{hotel.city}</span>
          </div>
          <div className="flex items-center gap-1">
            {editTrigger}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Maps
            </a>
          </div>
        </div>
      </div>

      {/* Resort fee warning */}
      {hotel.resortFee && (
        <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
          <TriangleAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Resort fee a pagar en hotel: </span>
            <span>
              ${hotel.resortFee.pricePerRoomPerNight}/hab·noche — total{" "}
              <span className="font-semibold">${resortFeeTotal}</span>
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Check-in
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatDate(hotel.checkIn)}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Check-out
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatDate(checkOut)}</p>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            {hotel.nights} {hotel.nights === 1 ? "noche" : "noches"}
          </span>
        </div>

        <div className="border-t" />

        {/* Room type */}
        <div className="flex items-center gap-2.5 text-sm">
          <BedDouble className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{hotel.roomType}</span>
        </div>

        {/* Rooms */}
        <div className="flex items-center gap-2.5 text-sm">
          <Users className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Habitaciones:</span>
          <span className="font-medium">{hotel.rooms}</span>
        </div>

        {/* Board plan */}
        <div className="flex items-center gap-2.5 text-sm">
          <UtensilsCrossed className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{hotel.boardPlan}</span>
        </div>
      </div>
    </Card>
  );
}
