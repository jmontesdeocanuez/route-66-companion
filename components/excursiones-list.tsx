"use client";

import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Activity, ActivityCard } from "@/components/activity-card";
import { ExcursionFormDialog } from "@/components/excursion-form-dialog";

interface ExcursionesListProps {
  excursiones: (Activity & { sortOrder?: number })[];
}

export function ExcursionesList({ excursiones }: ExcursionesListProps) {
  const router = useRouter();

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = excursiones.filter((e) => e.date >= today);
  const past = excursiones.filter((e) => e.date < today);

  function refresh() {
    router.refresh();
  }

  function editTrigger(excursion: Activity & { sortOrder?: number }) {
    return (
      <ExcursionFormDialog
        excursion={excursion}
        trigger={
          <Button variant="ghost" size="icon-sm" className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10">
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
        <p className="text-muted-foreground text-sm">{excursiones.length} excursiones</p>
        <ExcursionFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Añadir excursión
            </Button>
          }
          onSuccess={refresh}
        />
      </div>

      <div className="space-y-4">
        {upcoming.map((excursion) => (
          <ActivityCard key={excursion.id} activity={excursion} editTrigger={editTrigger(excursion)} />
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
          {past.map((excursion) => (
            <ActivityCard key={excursion.id} activity={excursion} editTrigger={editTrigger(excursion)} />
          ))}
        </div>
      )}
    </div>
  );
}
