import { prisma } from "@/lib/prisma";
import { ExcursionesList } from "@/components/excursiones-list";

export const metadata = {
  title: "Excursiones — Route 66 Companion",
};

export default async function ExcursionesPage() {
  const dbExcursiones = await prisma.excursion.findMany({
    orderBy: [{ date: "asc" }, { sortOrder: "asc" }],
  });

  const excursiones = dbExcursiones.map((e) => ({
    id: e.id,
    emoji: e.emoji,
    name: e.name,
    date: e.date,
    time: e.time,
    meetingTime: e.meetingTime ?? undefined,
    meetingPoint: e.meetingPoint ?? undefined,
    participants: e.participants,
    duration: e.duration ?? undefined,
    details: e.details,
    notes: e.notes,
    nonRefundable: e.nonRefundable,
    sortOrder: e.sortOrder,
  }));

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Excursiones</h1>
          <p className="text-muted-foreground">
            Actividades y excursiones reservadas durante el viaje
          </p>
        </div>

        <ExcursionesList excursiones={excursiones} />
      </div>
    </main>
  );
}
