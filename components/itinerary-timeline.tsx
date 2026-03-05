"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ItineraryCard } from "@/components/itinerary-card";
import type { ItineraryItemData } from "@/lib/itinerary-types";
import type { StopFormValues } from "@/components/stop-form";
import { MapPin, Navigation } from "lucide-react";

interface SortableItemProps {
  item: ItineraryItemData;
  editMode: boolean;
  tripStartDate: Date;
  tripEndDate: Date;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onEditStop?: (id: string, values: StopFormValues) => Promise<void>;
  onEditNote?: (id: string, noteText: string) => Promise<void>;
}

function SortableItem({ item, editMode, tripStartDate, tripEndDate, onToggleComplete, onDelete, onEditStop, onEditNote }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ItineraryCard
        item={item}
        editMode={editMode}
        tripStartDate={tripStartDate}
        tripEndDate={tripEndDate}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEditStop={onEditStop}
        onEditNote={onEditNote}
      />
    </div>
  );
}

interface ItineraryTimelineProps {
  items: ItineraryItemData[];
  editMode: boolean;
  tripStartDate: Date;
  tripEndDate: Date;
  onReorder: (items: ItineraryItemData[]) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEditStop: (id: string, values: StopFormValues) => Promise<void>;
  onEditNote: (id: string, noteText: string) => Promise<void>;
}

function getItemMapsLocation(item: ItineraryItemData): string | null {
  if (item.type === "stop" && item.stop?.mapsQuery) return item.stop.mapsQuery;
  if (item.type === "hotel" && item.hotel) return `${item.hotel.name} ${item.hotel.city}`;
  if (item.type === "flight" && item.flight) return `${item.flight.destinationCode} ${item.flight.destinationCity} airport`;
  if (item.type === "excursion" && item.excursion?.meetingPoint) return item.excursion.meetingPoint;
  return null;
}

function buildRouteSegments(locations: string[]): string[] {
  const BLOCK_SIZE = 5;
  const urls: string[] = [];
  for (let i = 0; i < locations.length; i += BLOCK_SIZE) {
    const block = locations.slice(i, Math.min(i + BLOCK_SIZE, locations.length));
    if (block.length < 2) break;
    const encoded = block.map((l) => encodeURIComponent(l));
    const origin = encoded[0];
    const destination = encoded[encoded.length - 1];
    const waypoints = encoded.slice(1, -1).join("|");
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    urls.push(url);
  }
  return urls;
}

export function ItineraryTimeline({
  items,
  editMode,
  tripStartDate,
  tripEndDate,
  onReorder,
  onToggleComplete,
  onDelete,
  onEditStop,
  onEditNote,
}: ItineraryTimelineProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);
  const orderedItems = [...activeItems, ...completedItems];

  const pendingLocations = activeItems
    .map(getItemMapsLocation)
    .filter((l): l is string => l !== null);
  const routeSegments = buildRouteSegments(pendingLocations);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((i) => i.id === active.id);
    const newIndex = orderedItems.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(orderedItems, oldIndex, newIndex));
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <MapPin className="size-8 opacity-30" />
        <p className="text-sm">No hay actividades planificadas para este día</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {routeSegments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {routeSegments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Navigation className="size-3" />
                {routeSegments.length === 1
                  ? "Ver ruta del día"
                  : `Ruta ${i * 5 + 1}–${Math.min((i + 1) * 5, pendingLocations.length)}`}
              </a>
            ))}
          </div>
        )}
        <div className="flex flex-col">
          {orderedItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Connector line: starts at center of icon (top: 12px padding + 18px = 30px), ends at bottom of pb-4 gap */}
              {index < orderedItems.length - 1 && (
                <div
                  className="absolute left-[29px] top-[30px] bottom-0 w-px border-l-2 border-dashed border-border/60 pointer-events-none"
                  aria-hidden
                />
              )}
              <div className={index < orderedItems.length - 1 ? "pb-4" : ""}>
                <SortableItem
                  item={item}
                  editMode={editMode}
                  tripStartDate={tripStartDate}
                  tripEndDate={tripEndDate}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEditStop={onEditStop}
                  onEditNote={onEditNote}
                />
              </div>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
