"use client";

import { useState } from "react";
import { Plane, BedDouble, MapPin, ArrowLeft, Sparkles, StickyNote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StopForm, type StopFormValues } from "@/components/stop-form";
import type { ItineraryItemData, ItineraryItemType } from "@/lib/itinerary-types";
import type { Flight, Hotel, Excursion } from "@/app/generated/prisma/client";

type Step = "type-select" | "flight-picker" | "hotel-picker" | "stop-form" | "excursion-picker" | "note-form";

interface AddItineraryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
  flights: Flight[];
  hotels: Hotel[];
  excursions: Excursion[];
  onItemAdded: (item: ItineraryItemData) => void;
  tripStartDate?: Date;
  tripEndDate?: Date;
}

const TYPE_OPTIONS: { type: ItineraryItemType; label: string; icon: React.ReactNode }[] = [
  { type: "flight", label: "Vuelo", icon: <Plane className="size-6" /> },
  { type: "hotel", label: "Hotel", icon: <BedDouble className="size-6" /> },
  { type: "stop", label: "Parada", icon: <MapPin className="size-6" /> },
  { type: "excursion", label: "Excursión", icon: <Sparkles className="size-6" /> },
  { type: "note", label: "Nota", icon: <StickyNote className="size-6" /> },
];

export function AddItineraryItemDialog({
  open,
  onOpenChange,
  currentDate,
  flights,
  hotels,
  excursions,
  onItemAdded,
  tripStartDate,
  tripEndDate,
}: AddItineraryItemDialogProps) {
  const [step, setStep] = useState<Step>("type-select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteText, setNoteText] = useState("");

  function handleClose(value: boolean) {
    if (!value) { setStep("type-select"); setNoteText(""); }
    onOpenChange(value);
  }

  function handleTypeSelect(type: ItineraryItemType) {
    if (type === "flight") setStep("flight-picker");
    else if (type === "hotel") setStep("hotel-picker");
    else if (type === "excursion") setStep("excursion-picker");
    else if (type === "note") setStep("note-form");
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

  async function handleExcursionSelect(excursion: Excursion) {
    await addItem({
      date: currentDate.toISOString(),
      type: "excursion",
      excursionId: excursion.id,
    });
  }

  async function handleStopSubmit(values: StopFormValues) {
    const { date: selectedDate, ...stopValues } = values;
    const date = selectedDate ? new Date(selectedDate).toISOString() : currentDate.toISOString();
    await addItem({
      date,
      type: "stop",
      stop: stopValues,
    });
  }

  async function handleNoteSubmit() {
    if (!noteText.trim()) return;
    await addItem({
      date: currentDate.toISOString(),
      type: "note",
      noteText: noteText.trim(),
    });
    setNoteText("");
  }

  const title =
    step === "type-select" ? "Añadir al itinerario"
    : step === "flight-picker" ? "Seleccionar vuelo"
    : step === "hotel-picker" ? "Seleccionar hotel"
    : step === "excursion-picker" ? "Seleccionar excursión"
    : step === "note-form" ? "Nueva nota"
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
          <div className="grid grid-cols-2 gap-3 pt-2">
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

        {step === "excursion-picker" && (
          <div className="flex flex-col gap-2 pt-2">
            {excursions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay excursiones disponibles
              </p>
            )}
            {excursions.map((excursion) => (
              <button
                key={excursion.id}
                onClick={() => handleExcursionSelect(excursion)}
                disabled={isSubmitting}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent transition-colors disabled:opacity-50"
              >
                <span className="text-2xl leading-none mt-0.5 shrink-0">{excursion.emoji}</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{excursion.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {excursion.date} · {excursion.time}
                    {excursion.meetingPoint && ` · ${excursion.meetingPoint}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "stop-form" && (
          <div className="pt-2">
            <StopForm
              onSubmit={handleStopSubmit}
              isSubmitting={isSubmitting}
              defaultValues={{ date: currentDate.toISOString().slice(0, 10) }}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
            />
          </div>
        )}

        {step === "note-form" && (
          <div className="pt-2 flex flex-col gap-4">
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={5}
              placeholder="Escribe tu nota aquí..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
            <Button
              onClick={handleNoteSubmit}
              disabled={isSubmitting || !noteText.trim()}
              className="w-full"
            >
              Añadir nota
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
