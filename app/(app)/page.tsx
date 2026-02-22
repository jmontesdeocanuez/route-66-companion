import { getSession } from "@/lib/session";
import { getTripConfig } from "@/lib/trip-config";
import { TripCountdown } from "@/components/trip-countdown";

export default async function Home() {
  const [session, tripConfig] = await Promise.all([getSession(), getTripConfig()]);

  return (
    <main className="flex flex-col gap-10 p-6 pt-24">
      <div className="space-y-1 animate-welcome-greeting">
        <p className="text-xl text-muted-foreground text-center">
          Bienvenido, <span className="text-foreground font-semibold">{session.name}</span>
        </p>
      </div>
      <TripCountdown startDate={tripConfig.startDate} endDate={tripConfig.endDate} />
    </main>
  );
}
