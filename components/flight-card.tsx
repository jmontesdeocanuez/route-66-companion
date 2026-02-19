import { Plane, Calendar, Clock, Tag, Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  originCountry: string;
  destinationCode: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  passengers: number;
  confirmationCode: string;
  pricePerPerson: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FlightCard({ flight }: { flight: Flight }) {
  const totalPrice = flight.pricePerPerson * flight.passengers;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-primary-foreground text-xl font-bold leading-tight">
              {flight.originCity} → {flight.destinationCity}
            </h2>
            <p className="mt-1 text-primary-foreground/70 text-sm">
              {flight.airline}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 pt-1">
            <Plane className="size-3.5 text-primary-foreground/80" />
            <span className="text-xs font-bold tracking-wide text-primary-foreground">
              {flight.flightNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Route visualization */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-center">
            <p className="text-3xl font-bold tracking-tight">{flight.originCode}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{flight.originCountry}</p>
          </div>
          <div className="flex flex-1 items-center gap-2 px-3">
            <div className="h-px flex-1 bg-border" />
            <div className="flex flex-col items-center gap-0.5">
              <Plane className="size-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{flight.duration}</span>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold tracking-tight">{flight.destinationCode}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{flight.destinationCountry}</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Departure & Arrival */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Salida
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatDate(flight.departureDate)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{flight.departureTime}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Llegada
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{formatDate(flight.arrivalDate)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{flight.arrivalTime}</p>
            </div>
          </div>
        </div>

        <div className="border-t" />

        {/* Cabin class */}
        <div className="flex items-center gap-2.5 text-sm">
          <Plane className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{flight.cabinClass}</span>
        </div>

        {/* Passengers */}
        <div className="flex items-center gap-2.5 text-sm">
          <Users className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Pasajeros:</span>
          <span className="font-semibold">{flight.passengers}</span>
        </div>

        {/* Confirmation code */}
        <div className="flex items-center gap-2.5 text-sm">
          <Tag className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Confirmación:</span>
          <span className="font-mono text-xs font-semibold tracking-wide">
            {flight.confirmationCode}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/40 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="text-base font-bold text-foreground">
            {flight.pricePerPerson.toLocaleString("es-ES")} €
          </span>{" "}
          / persona
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{flight.passengers} {flight.passengers === 1 ? "pasajero" : "pasajeros"}</p>
          <p className="text-lg font-bold">{totalPrice.toLocaleString("es-ES")} €</p>
        </div>
      </div>
    </Card>
  );
}
