"use client";

import { useState } from "react";
import { Plane, BedDouble, MapPin, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StopForm, type StopFormValues } from "@/components/stop-form";
import type { ItineraryItemData, ItineraryItemType } from "@/lib/itinerary-types";
import type { Flight, Hotel } from "@/app/generated/prisma/client";

type Step = "type-select" | "flight-picker" | "hotel-picker" | "stop-form";

interface AddItineraryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  flights: Flight[];
  hotels: Hotel[];
  onItemAdded: (item: ItineraryItemData) => void;
}

const TYPE_OPTIONS: { type: ItineraryItemType; label: string; icon: React.ReactNode }[] = [
  { type: "flight", label: "Vuelo", icon: <Plane className="size-6" /> },
  { type: "hotel", label: "Hotel", icon: <BedDouble className="size-6" /> },
  { type: "stop", label: "Parada", icon: <MapPin className="size-6" /> },
];

export function AddItineraryItemDialog({
  open,
  onOpenChange,
  currentDate,
  flights,
  hotels,
  onItemAdded,
}: AddItineraryItemDialogProps) {
  const [step, setStep] = useState<Step>("type-select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose(value: boolean) {
    if (!value) setStep("type-select");
    onOpenChange(value);
  }

  function handleTypeSelect(type: ItineraryItemType) {
    if (type === "flight") setStep("flight-picker");
    else if (type === "hotel") setStep("hotel-picker");
    else setStep("stop-form");
  }

  async function addItem(body: Record<string, unknown>) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al añadir el item");
      const item = await res.json() as ItineraryItemData;
      onItemAdded(item);
      handleClose(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFlightSelect(flight: Flight) {
    await addItem({
      date: currentDate.toISOString(),
      type: "flight",
      flightId: flight.id,
    });
  }

  async function handleHotelSelect(hotel: Hotel) {
    await addItem({
      date: currentDate.toISOString(),
      type: "hotel",
      hotelId: hotel.id,
    });
  }

  async function handleStopSubmit(values: StopFormValues) {
    await addItem({
      date: currentDate.toISOString(),
      type: "stop",
      stop: values,
    });
  }

  const title =
    step === "type-select" ? "Añadir al itinerario"
    : step === "flight-picker" ? "Seleccionar vuelo"
    : step === "hotel-picker" ? "Seleccionar hotel"
    : "Nueva parada";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "type-select" && (
              <button
                onClick={() => setStep("type-select")}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        {step === "type-select" && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {TYPE_OPTIONS.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span className="text-muted-foreground">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        )}

        {step === "flight-picker" && (
          <div className="flex flex-col gap-2 pt-2">
            {flights.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay vuelos disponibles
              </p>
            )}
            {flights.map((flight) => (
              <button
                key={flight.id}
                onClick={() => handleFlightSelect(flight)}
                disabled={isSubmitting}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent transition-colors disabled:opacity-50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <Plane className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    {flight.originCode} → {flight.destinationCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flight.airline} · {flight.flightNumber} · {flight.departureDate} {flight.departureTime}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "hotel-picker" && (
          <div className="flex flex-col gap-2 pt-2">
            {hotels.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay hoteles disponibles
              </p>
            )}
            {hotels.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => handleHotelSelect(hotel)}
                disabled={isSubmitting}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent transition-colors disabled:opacity-50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                  <BedDouble className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{hotel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {hotel.city} · {hotel.nights} {hotel.nights === 1 ? "noche" : "noches"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "stop-form" && (
          <div className="pt-2">
            <StopForm onSubmit={handleStopSubmit} isSubmitting={isSubmitting} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
