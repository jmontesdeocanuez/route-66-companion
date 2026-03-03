"use client";

import { useState, useCallback } from "react";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { Plus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayNavigator } from "@/components/day-navigator";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { ItineraryDayComplete } from "@/components/itinerary-day-complete";
import { AddItineraryItemDialog } from "@/components/add-itinerary-item-dialog";
import type { ItineraryItemData } from "@/lib/itinerary-types";
import type { StopFormValues } from "@/components/stop-form";
import type { Flight, Hotel } from "@/app/generated/prisma/client";

interface ItineraryProps {
  startDate: Date;
  endDate: Date;
  initialItems: ItineraryItemData[];
  initialDate: Date;
  flights: Flight[];
  hotels: Hotel[];
}

export function Itinerary({ startDate, endDate, initialItems, initialDate, flights, hotels }: ItineraryProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [items, setItems] = useState<ItineraryItemData[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  async function handleDateChange(date: Date) {
    setCurrentDate(date);
    setEditMode(false);
    setIsLoading(true);
    try {
      const dateStr = date.toISOString().slice(0, 10);
      const res = await fetch(`/api/itinerary?date=${dateStr}`);
      if (!res.ok) throw new Error("Error fetching itinerary");
      const data = await res.json() as ItineraryItemData[];
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleComplete = useCallback(async (id: string, completed: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed } : item))
    );
    try {
      await fetch(`/api/itinerary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch (e) {
      console.error(e);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, completed: !completed } : item))
      );
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const removed = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      if (removed) setItems((prev) => [...prev, removed]);
    }
  }, [items]);

  const handleReorder = useCallback(async (reordered: ItineraryItemData[]) => {
    const updated = reordered.map((item, index) => ({ ...item, sortOrder: index }));
    setItems(updated);
    try {
      await fetch("/api/itinerary/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updated.map(({ id, sortOrder }) => ({ id, sortOrder })) }),
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  function handleItemAdded(item: ItineraryItemData) {
    setItems((prev) => [...prev, item]);
  }

  const handleEditStop = useCallback(async (itemId: string, values: StopFormValues) => {
    const item = items.find((i) => i.id === itemId);
    if (!item?.stopId) return;
    try {
      const res = await fetch(`/api/stops/${item.stopId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Error updating stop");
      const updatedStop = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, stop: updatedStop } : i))
      );
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const dayNumber = differenceInCalendarDays(currentDate, startDate) + 1;
  const allCompleted = items.length > 0 && items.every((i) => i.completed);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Itinerario</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditMode((v) => !v)}
          className="gap-1.5"
        >
          {editMode ? (
            <>
              <Check className="size-4" />
              Listo
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              Editar
            </>
          )}
        </Button>
      </div>

      <DayNavigator
        currentDate={currentDate}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : (
        <>
          <ItineraryTimeline
            items={items}
            editMode={editMode}
            onReorder={handleReorder}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onEditStop={handleEditStop}
          />
          {allCompleted && !editMode && (
            <ItineraryDayComplete
              key={currentDate.toISOString()}
              currentDate={currentDate}
              tripStartDate={startDate}
            />
          )}
        </>
      )}

      {editMode && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-4" />
          Añadir al día {dayNumber}
        </Button>
      )}

      <AddItineraryItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        currentDate={currentDate}
        flights={flights}
        hotels={hotels}
        onItemAdded={handleItemAdded}
      />
    </section>
  );
}
