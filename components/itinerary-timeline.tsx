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
import { MapPin } from "lucide-react";

interface SortableItemProps {
  item: ItineraryItemData;
  editMode: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onEditStop?: (id: string, values: StopFormValues) => Promise<void>;
}

function SortableItem({ item, editMode, onToggleComplete, onDelete, onEditStop }: SortableItemProps) {
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
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEditStop={onEditStop}
      />
    </div>
  );
}

interface ItineraryTimelineProps {
  items: ItineraryItemData[];
  editMode: boolean;
  onReorder: (items: ItineraryItemData[]) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEditStop: (id: string, values: StopFormValues) => Promise<void>;
}

export function ItineraryTimeline({
  items,
  editMode,
  onReorder,
  onToggleComplete,
  onDelete,
  onEditStop,
}: ItineraryTimelineProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);
  const orderedItems = [...activeItems, ...completedItems];

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
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEditStop={onEditStop}
                />
              </div>
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
