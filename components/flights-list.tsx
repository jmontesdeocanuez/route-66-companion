"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flight, FlightCard } from "@/components/flight-card";
import { FlightFormDialog } from "@/components/flight-form-dialog";

interface FlightsListProps {
  flights: Flight[];
}

export function FlightsList({ flights }: FlightsListProps) {
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = flights.filter((f) => f.departureDate >= today);
  const past = flights.filter((f) => f.departureDate < today);

  function refresh() {
    router.refresh();
  }

  function editTrigger(flight: Flight) {
    return (
      <FlightFormDialog
        flight={flight}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
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
        <p className="text-muted-foreground text-sm">{flights.length} vuelos</p>
        <FlightFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Añadir vuelo
            </Button>
          }
          onSuccess={refresh}
        />
      </div>

      <div className="space-y-4">
        {upcoming.map((flight) => (
          <FlightCard key={flight.id} flight={flight} editTrigger={editTrigger(flight)} />
        ))}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Anteriores
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          {past.map((flight) => (
            <FlightCard key={flight.id} flight={flight} editTrigger={editTrigger(flight)} />
          ))}
        </div>
      )}
    </div>
  );
}
