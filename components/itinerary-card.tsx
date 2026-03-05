"use client";

import { useState } from "react";
import { Plane, BedDouble, MapPin, Clock, CheckCircle2, Circle, GripVertical, Trash2, Pencil, Search, ExternalLink, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { StopForm, type StopFormValues } from "@/components/stop-form";
import { FlightCard } from "@/components/flight-card";
import { HotelCard } from "@/components/hotel-card";
import { ActivityCard } from "@/components/activity-card";
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
  onEditNote?: (id: string, noteText: string) => Promise<void>;
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
        <p className="font-semibold text-sm leading-tight break-words">{hotel.name}</p>
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
        <p className="font-semibold text-sm leading-tight break-words">{stop.title}</p>
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
    </div>
  );
}

function ExcursionSummary({ item }: { item: ItineraryItemData }) {
  const excursion = item.excursion!;
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
        {excursion.emoji}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-tight break-words">{excursion.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {excursion.time}{excursion.meetingPoint ? ` · ${excursion.meetingPoint}` : ""}
        </p>
      </div>
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
  onEditNote,
}: ItineraryCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.noteText ?? "");

  async function handleStopEdit(values: StopFormValues) {
    if (!onEditStop) return;
    setIsSubmitting(true);
    await onEditStop(item.id, values);
    setIsSubmitting(false);
    setEditDialogOpen(false);
  }

  async function handleNoteEdit() {
    if (!onEditNote) return;
    setIsSubmitting(true);
    await onEditNote(item.id, noteText);
    setIsSubmitting(false);
    setEditingNote(false);
  }

  const stop = item.stop;

  // Notes render differently — no card chrome
  if (item.type === "note") {
    return (
      <div className="flex items-start gap-2 px-1 py-1">
        {editMode && (
          <button
            className="shrink-0 mt-0.5 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground"
            aria-label="Arrastrar"
            {...dragHandleProps}
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <StickyNote className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
        {editingNote ? (
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              className="w-full rounded-md border bg-background px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleNoteEdit} disabled={isSubmitting}>
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setNoteText(item.noteText ?? ""); setEditingNote(false); }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="flex-1 text-sm text-muted-foreground leading-snug break-words whitespace-pre-wrap">
            {item.noteText}
          </p>
        )}
        {editMode && !editingNote && (
          <>
            {onEditNote && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-7 text-muted-foreground"
                onClick={() => setEditingNote(true)}
                aria-label="Editar nota"
              >
                <Pencil className="size-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(item.id)}
                aria-label="Eliminar nota"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

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

        <div
          className={cn("flex-1 min-w-0", !editMode && "cursor-pointer")}
          onClick={!editMode ? () => setDetailSheetOpen(true) : undefined}
        >
          {item.type === "flight" && item.flight && <FlightSummary item={item} />}
          {item.type === "hotel" && item.hotel && <HotelSummary item={item} />}
          {item.type === "stop" && stop && <StopSummary item={item} />}
          {item.type === "excursion" && item.excursion && <ExcursionSummary item={item} />}
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
                mapsQuery: stop.mapsQuery ?? "",
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
                  className="h-72 w-full object-cover"
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
                {stop.mapsQuery && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/25 transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    Ver en Maps
                  </a>
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
          {item.type === "excursion" && item.excursion && (
            <div className="pb-6">
              <ActivityCard activity={{
                ...item.excursion,
                meetingTime: item.excursion.meetingTime ?? undefined,
                meetingPoint: item.excursion.meetingPoint ?? undefined,
                duration: item.excursion.duration ?? undefined,
              }} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
