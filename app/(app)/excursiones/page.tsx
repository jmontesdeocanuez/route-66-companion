import { Activity, ActivityCard } from "@/components/activity-card";

export const metadata = {
  title: "Excursiones — Route 66 Companion",
};

const activities: Activity[] = [
  {
    id: "1",
    emoji: "🚁",
    name: "Excursión en helicóptero al Gran Cañón (North Canyon Tour)",
    date: "2026-03-29",
    time: "09:05",
    meetingTime: "08:35",
    meetingPoint: "3568 Airport Rd, Grand Canyon Village, Arizona 86023",
    participants: 4,
    duration: "25–30 minutos",
    details: [
      "Vuelo en helicóptero modelo EcoStar Helicopter HGG-1.",
    ],
    notes: [
      "Los pasajeros deberán presentarse con antelación en el punto de encuentro.",
    ],
  },
  {
    id: "2",
    emoji: "🪶",
    name: "Excursión de atrapasueños en Monument Valley",
    date: "2026-03-30",
    time: "16:30",
    participants: 7,
  },
  {
    id: "3",
    emoji: "🏜️",
    name: "Tour por el Cañón del Antílope Superior (Upper Antelope Canyon)",
    date: "2026-03-31",
    time: "15:45",
    meetingPoint: "Tse Bighanilini Tours, AZ-98 Milepost 299.8, Page, AZ 86040, Estados Unidos",
    participants: 7,
    details: [
      "El recorrido incluye servicio de traslado desde el punto de entrada.",
      "Tour impartido en inglés.",
    ],
    notes: [
      "Es indispensable llegar al menos 45 minutos antes de la hora de entrada asignada.",
    ],
    nonRefundable: true,
  },
  {
    id: "4",
    emoji: "🎢",
    name: "Día en Disneyland Park y Disney California Adventure",
    date: "2026-04-06",
    time: "Horario oficial de apertura y cierre de ambos parques",
    participants: 2,
    details: [
      "Entrada tipo Park Hopper con Multi Pass Lightning Lane.",
      "Acceso el mismo día a ambos parques: Disneyland Park y Disney California Adventure.",
      "Incluye uso del sistema Lightning Lane para acceder más rápido a atracciones seleccionadas.",
    ],
    notes: [
      "Se recomienda llegar temprano para aprovechar al máximo el acceso Park Hopper.",
      "Reservar las franjas Lightning Lane desde la app oficial en cuanto sea posible.",
    ],
  },
];

export default function ExcursionesPage() {
  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Excursiones</h1>
          <p className="text-muted-foreground">
            Actividades y excursiones reservadas durante el viaje
          </p>
        </div>

        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </main>
  );
}
