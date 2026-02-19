import { Star, MapPin, Calendar, BedDouble, Tag, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Hotel {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  category: number;
  checkIn: string;
  checkOut: string;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  confirmationCode: string;
  phone: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function countNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const nights = countNights(hotel.checkIn, hotel.checkOut);
  const totalPrice = nights * hotel.pricePerNight;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-primary-foreground text-xl font-bold leading-tight">
            {hotel.name}
          </h2>
          <div className="flex shrink-0 items-center gap-0.5 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < hotel.category
                    ? "fill-amber-400 text-amber-400"
                    : "fill-white/20 text-white/20"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-primary-foreground/70">
          <MapPin className="size-3.5 shrink-0" />
          <span className="text-sm">
            {hotel.city}, {hotel.state}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Address */}
        <div className="flex items-start gap-2.5">
          <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{hotel.address}</span>
        </div>

        <div className="border-t" />

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
              <p className="text-sm font-semibold">{formatDate(hotel.checkOut)}</p>
            </div>
          </div>
        </div>

        <div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            {nights} {nights === 1 ? "noche" : "noches"}
          </span>
        </div>

        <div className="border-t" />

        {/* Room type */}
        <div className="flex items-center gap-2.5 text-sm">
          <BedDouble className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{hotel.roomType}</span>
        </div>

        {/* Confirmation code */}
        <div className="flex items-center gap-2.5 text-sm">
          <Tag className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Confirmación:</span>
          <span className="font-mono text-xs font-semibold tracking-wide">
            {hotel.confirmationCode}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5 text-sm">
          <Phone className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{hotel.phone}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="text-base font-bold text-foreground">
            ${hotel.pricePerNight}
          </span>{" "}
          / noche
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{nights} noches</p>
          <p className="text-lg font-bold">${totalPrice.toLocaleString("es-ES")}</p>
        </div>
      </div>
    </Card>
  );
}
