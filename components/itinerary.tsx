"use client";

import { useState, useCallback, useEffect } from "react";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { Plus, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayNavigator } from "@/components/day-navigator";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { ItineraryDayComplete } from "@/components/itinerary-day-complete";
import { AddItineraryItemDialog } from "@/components/add-itinerary-item-dialog";
import type { ItineraryItemData } from "@/lib/itinerary-types";
import type { StopFormValues } from "@/components/stop-form";
import type { Flight, Hotel, Excursion } from "@/app/generated/prisma/client";

interface ItineraryProps {
  startDate: Date;
  endDate: Date;
  initialItems: ItineraryItemData[];
  initialDate: Date;
  flights: Flight[];
  hotels: Hotel[];
  excursions: Excursion[];
}

function useVisibleDays(): number {
  const [visibleDays, setVisibleDays] = useState(1);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleDays(4);
      else if (w >= 640) setVisibleDays(2);
      else setVisibleDays(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visibleDays;
}

async function fetchItems(date: Date): Promise<ItineraryItemData[]> {
  const dateStr = date.toISOString().slice(0, 10);
  const res = await fetch(`/api/itinerary?date=${dateStr}`);
  if (!res.ok) throw new Error("Error fetching itinerary");
  return res.json();
}

interface DayColumn {
  date: Date;
  items: ItineraryItemData[];
  isLoading: boolean;
}

export function Itinerary({ startDate, endDate, initialItems, initialDate, flights, hotels, excursions }: ItineraryProps) {
  const visibleDays = useVisibleDays();
  const [anchorDate, setAnchorDate] = useState<Date>(initialDate);
  const [columns, setColumns] = useState<DayColumn[]>([
    { date: initialDate, items: initialItems, isLoading: false },
  ]);
  const [editMode, setEditMode] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogDate, setAddDialogDate] = useState<Date>(initialDate);

  // Rebuild columns when anchorDate or visibleDays changes
  useEffect(() => {
    const tripEnd = startOfDay(endDate);

    async function rebuild() {
      const dates: Date[] = [];
      for (let i = 0; i < visibleDays; i++) {
        const d = startOfDay(addDays(anchorDate, i));
        if (d <= tripEnd) dates.push(d);
      }

      // Mark all as loading (keep existing items while loading)
      setColumns((prev) =>
        dates.map((d) => {
          const existing = prev.find(
            (c) => c.date.toISOString().slice(0, 10) === d.toISOString().slice(0, 10)
          );
          return existing ?? { date: d, items: [], isLoading: true };
        })
      );

      // Fetch only the dates we don't already have
      const results = await Promise.all(
        dates.map(async (d) => {
          const key = d.toISOString().slice(0, 10);
          // Check if we already had this date loaded (anchorDate didn't change, visibleDays did)
          const existing = columns.find(
            (c) => c.date.toISOString().slice(0, 10) === key && !c.isLoading
          );
          if (existing) return existing;
          try {
            const items = await fetchItems(d);
            return { date: d, items, isLoading: false };
          } catch {
            return { date: d, items: [], isLoading: false };
          }
        })
      );

      setColumns(results);
    }

    rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorDate, visibleDays, endDate]);

  function handleDateChange(date: Date) {
    setAnchorDate(startOfDay(date));
    setEditMode(false);
  }

  const handleToggleComplete = useCallback(async (id: string, completed: boolean) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        items: col.items.map((item) => (item.id === id ? { ...item, completed } : item)),
      }))
    );
    try {
      await fetch(`/api/itinerary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
    } catch (e) {
      console.error(e);
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.map((item) => (item.id === id ? { ...item, completed: !completed } : item)),
        }))
      );
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    let removed: ItineraryItemData | undefined;
    setColumns((prev) =>
      prev.map((col) => {
        const found = col.items.find((i) => i.id === id);
        if (found) removed = found;
        return { ...col, items: col.items.filter((i) => i.id !== id) };
      })
    );
    try {
      await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      if (removed) {
        const itemDate = startOfDay(new Date(removed.date));
        setColumns((prev) =>
          prev.map((col) =>
            col.date.toISOString().slice(0, 10) === itemDate.toISOString().slice(0, 10)
              ? { ...col, items: [...col.items, removed!] }
              : col
          )
        );
      }
    }
  }, []);

  const handleReorder = useCallback(async (date: Date, reordered: ItineraryItemData[]) => {
    const updated = reordered.map((item, index) => ({ ...item, sortOrder: index }));
    const key = date.toISOString().slice(0, 10);
    setColumns((prev) =>
      prev.map((col) =>
        col.date.toISOString().slice(0, 10) === key ? { ...col, items: updated } : col
      )
    );
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

  const handleEditNote = useCallback(async (itemId: string, noteText: string) => {
    try {
      await fetch(`/api/itinerary/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText }),
      });
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          items: col.items.map((i) => (i.id === itemId ? { ...i, noteText } : i)),
        }))
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleEditStop = useCallback(async (itemId: string, values: StopFormValues) => {
    let stopId: string | null = null;
    let originalItem: ItineraryItemData | undefined;
    for (const col of columns) {
      const item = col.items.find((i) => i.id === itemId);
      if (item?.stopId) { stopId = item.stopId; originalItem = item; break; }
    }
    if (!stopId || !originalItem) return;

    const { date: newDateStr, ...stopValues } = values;

    try {
      // Update stop fields
      const stopRes = await fetch(`/api/stops/${stopId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopValues),
      });
      if (!stopRes.ok) throw new Error("Error updating stop");
      const updatedStop = await stopRes.json();

      // Update itinerary item date if changed
      const originalDateStr = startOfDay(new Date(originalItem.date)).toISOString().slice(0, 10);
      const dateChanged = newDateStr && newDateStr !== originalDateStr;

      if (dateChanged) {
        await fetch(`/api/itinerary/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: newDateStr }),
        });
      }

      setColumns((prev) =>
        prev.map((col) => {
          if (!dateChanged) {
            // Just update stop data in place
            return {
              ...col,
              items: col.items.map((i) => (i.id === itemId ? { ...i, stop: updatedStop } : i)),
            };
          }
          const newDate = startOfDay(new Date(newDateStr!));
          const colKey = col.date.toISOString().slice(0, 10);
          const newDateKey = newDate.toISOString().slice(0, 10);

          if (colKey === originalDateStr) {
            // Remove from original column
            return { ...col, items: col.items.filter((i) => i.id !== itemId) };
          }
          if (colKey === newDateKey) {
            // Add to new column
            const updatedItem = { ...originalItem!, date: newDate, stop: updatedStop };
            return { ...col, items: [...col.items, updatedItem] };
          }
          return col;
        })
      );
    } catch (e) {
      console.error(e);
    }
  }, [columns]);

  function handleItemAdded(item: ItineraryItemData) {
    const itemDate = startOfDay(new Date(item.date)).toISOString().slice(0, 10);
    setColumns((prev) =>
      prev.map((col) =>
        col.date.toISOString().slice(0, 10) === itemDate
          ? { ...col, items: [...col.items, item] }
          : col
      )
    );
  }

  const isFirst = differenceInCalendarDays(anchorDate, startDate) <= 0;
  const isLast = differenceInCalendarDays(addDays(anchorDate, visibleDays - 1), endDate) >= 0;

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
        dates={columns.map((c) => c.date)}
        startDate={startDate}
        isFirst={isFirst}
        isLast={isLast}
        onPrev={() => handleDateChange(addDays(anchorDate, -visibleDays))}
        onNext={() => handleDateChange(addDays(anchorDate, visibleDays))}
      />

      <div className={`grid gap-6 ${visibleDays === 1 ? "" : visibleDays === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
        {columns.map((col) => {
          const dayNumber = differenceInCalendarDays(col.date, startDate) + 1;
          const nonNoteItems = col.items.filter((i) => i.type !== "note");
          const allCompleted = nonNoteItems.length > 0 && nonNoteItems.every((i) => i.completed);

          return (
            <div key={col.date.toISOString()} className="space-y-4">
              {col.isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
                </div>
              ) : (
                <>
                  <ItineraryTimeline
                    items={col.items}
                    editMode={editMode}
                    tripStartDate={startDate}
                    tripEndDate={endDate}
                    onReorder={(reordered) => handleReorder(col.date, reordered)}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onEditStop={handleEditStop}
                    onEditNote={handleEditNote}
                  />
                  {allCompleted && !editMode && (
                    <ItineraryDayComplete
                      key={col.date.toISOString()}
                      currentDate={col.date}
                      tripStartDate={startDate}
                    />
                  )}
                </>
              )}

              {editMode && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setAddDialogDate(col.date);
                    setAddDialogOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Añadir al día {dayNumber}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <AddItineraryItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        currentDate={addDialogDate}
        flights={flights}
        hotels={hotels}
        excursions={excursions}
        onItemAdded={handleItemAdded}
        tripStartDate={startDate}
        tripEndDate={endDate}
      />
    </section>
  );
}
