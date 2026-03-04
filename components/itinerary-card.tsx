"use client";

import { useState } from "react";
import { Plane, BedDouble, MapPin, Clock, CheckCircle2, Circle, GripVertical, Trash2, Pencil, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StopForm, type StopFormValues } from "@/components/stop-form";
import { FlightCard } from "@/components/flight-card";
import { HotelCard } from "@/components/hotel-card";
import type { ItineraryItemData } from "@/lib/itinerary-types";

interface ItineraryCardProps {
  item: ItineraryItemData;
  editMode?: boolean;
  tripStartDate?: Date;
  tripEndDate?: Date;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onEditStop?: (id: string, values: StopFormValues) => Promise<void>;
}

function FlightSummary({ item }: { item: ItineraryItemData }) {
  const flight = item.flight!;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Plane className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight">
          {flight.originCode} → {flight.destinationCode}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {flight.airline} · {flight.flightNumber} · {flight.departureTime}
        </p>
      </div>
    </div>
  );
}

function HotelSummary({ item }: { item: ItineraryItemData }) {
  const hotel = item.hotel!;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <BedDouble className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{hotel.name}</p>
        <p className="text-xs text-muted-foreground">
          {hotel.city} · {hotel.nights} {hotel.nights === 1 ? "noche" : "noches"}
        </p>
      </div>
    </div>
  );
}

function StopSummary({ item }: { item: ItineraryItemData }) {
  const stop = item.stop!;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <MapPin className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{stop.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {[stop.location, stop.time ? <span key="time" className="inline-flex items-center gap-0.5"><Clock className="size-2.5" />{stop.time}</span> : null]
            .filter(Boolean)
            .reduce<React.ReactNode[]>((acc, el, i) => {
              if (i > 0) acc.push(" · ");
              acc.push(el);
              return acc;
            }, [])}
          {!stop.location && !stop.time && (stop.description ?? "Parada")}
        </p>
      </div>
      {stop.imageUrl && (
        <img
          src={stop.imageUrl}
          alt={stop.title}
          className="ml-auto size-10 shrink-0 rounded-md object-cover"
        />
      )}
    </div>
  );
}

export function ItineraryCard({
  item,
  editMode,
  tripStartDate,
  tripEndDate,
  dragHandleProps,
  onToggleComplete,
  onDelete,
  onEditStop,
}: ItineraryCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStopEdit(values: StopFormValues) {
    if (!onEditStop) return;
    setIsSubmitting(true);
    await onEditStop(item.id, values);
    setIsSubmitting(false);
    setEditDialogOpen(false);
  }

  const stop = item.stop;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-card px-3 py-3 shadow-sm transition-opacity",
          item.completed && "opacity-40"
        )}
      >
        {editMode && (
          <button
            className="shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground"
            aria-label="Arrastrar"
            {...dragHandleProps}
          >
            <GripVertical className="size-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {item.type === "flight" && item.flight && <FlightSummary item={item} />}
          {item.type === "hotel" && item.hotel && <HotelSummary item={item} />}
          {item.type === "stop" && stop && <StopSummary item={item} />}
        </div>

        {!editMode && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-8 text-muted-foreground hover:text-primary"
              onClick={() => setDetailSheetOpen(true)}
              aria-label="Ver detalles"
            >
              <Search className="size-4" />
            </Button>

            {onToggleComplete && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-8 text-muted-foreground hover:text-primary"
                onClick={() => onToggleComplete(item.id, !item.completed)}
                aria-label={item.completed ? "Marcar como pendiente" : "Marcar como completado"}
              >
                {item.completed ? (
                  <CheckCircle2 className="size-4 text-primary" />
                ) : (
                  <Circle className="size-4" />
                )}
              </Button>
            )}
          </div>
        )}

        {editMode && item.type === "stop" && onEditStop && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 size-8"
            onClick={() => setEditDialogOpen(true)}
            aria-label="Editar parada"
          >
            <Pencil className="size-4" />
          </Button>
        )}

        {editMode && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(item.id)}
            aria-label="Eliminar"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {item.type === "stop" && stop && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar parada</DialogTitle>
            </DialogHeader>
            <StopForm
              defaultValues={{
                title: stop.title,
                description: stop.description ?? "",
                location: stop.location ?? "",
                time: stop.time ?? "",
                imageUrl: stop.imageUrl ?? "",
                date: new Date(item.date).toISOString().slice(0, 10),
              }}
              onSubmit={handleStopEdit}
              isSubmitting={isSubmitting}
              submitLabel="Guardar cambios"
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
            />
          </DialogContent>
        </Dialog>
      )}

      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="p-0 gap-0 rounded-t-2xl max-h-[90vh] overflow-y-auto">
          {/* Drag pill */}
          <div className="flex justify-center pt-4 pb-3">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
          </div>
          <SheetTitle className="sr-only">Detalles</SheetTitle>
          {item.type === "flight" && item.flight && (
            <div className="pb-6">
              <FlightCard flight={item.flight} />
            </div>
          )}
          {item.type === "hotel" && item.hotel && (
            <div className="pb-6">
              <HotelCard hotel={{ ...item.hotel, checkIn: new Date(item.hotel.checkIn).toISOString().slice(0, 10), imageUrl: item.hotel.imageUrl ?? undefined }} />
            </div>
          )}
          {item.type === "stop" && stop && (
            <div className="pb-6">
              {stop.imageUrl && (
                <img
                  src={stop.imageUrl}
                  alt={stop.title}
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="bg-primary px-6 py-5">
                <h2 className="text-primary-foreground text-xl font-bold leading-tight">{stop.title}</h2>
                {stop.location && (
                  <div className="mt-2 flex items-center gap-1.5 text-primary-foreground/70">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="text-sm">{stop.location}</span>
                  </div>
                )}
              </div>
              <div className="px-6 py-5 space-y-3">
                {stop.time && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="size-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{stop.time}</span>
                  </div>
                )}
                {stop.description && (
                  <p className="text-sm text-muted-foreground">{stop.description}</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
