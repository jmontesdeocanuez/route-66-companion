import { getSession } from "@/lib/session";
import { getTripConfig } from "@/lib/trip-config";
import { TripCountdown } from "@/components/trip-countdown";
import { Itinerary } from "@/components/itinerary";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export default async function Home() {
  const [session, tripConfig, flights, hotels] = await Promise.all([
    getSession(),
    getTripConfig(),
    prisma.flight.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.hotel.findMany({ orderBy: { checkIn: "asc" } }),
  ]);

  // Determine the default day to show: today if within trip, otherwise trip start
  const today = startOfDay(new Date());
  const tripStart = startOfDay(tripConfig.startDate);
  const tripEnd = startOfDay(tripConfig.endDate);

  const defaultDate =
    today >= tripStart && today <= tripEnd ? today : tripStart;

  const nextDay = new Date(defaultDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const initialItems = await prisma.itineraryItem.findMany({
    where: {
      date: { gte: defaultDate, lt: nextDay },
    },
    include: { flight: true, hotel: true, stop: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="flex flex-col gap-10 p-6 pt-24">
      <div className="space-y-3 animate-welcome-greeting text-center">
        <p className="text-xl text-muted-foreground">
          Bienvenido, <span className="text-foreground font-semibold">{session.displayName ?? session.name}</span>
        </p>
        <div className="road-separator max-w-xs mx-auto" />
      </div>
      <TripCountdown startDate={tripConfig.startDate} endDate={tripConfig.endDate} />
      <Itinerary
        startDate={tripConfig.startDate}
        endDate={tripConfig.endDate}
        initialItems={initialItems}
        initialDate={defaultDate}
        flights={flights}
        hotels={hotels}
      />
    </main>
  );
}
