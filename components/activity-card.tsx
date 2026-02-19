import { Calendar, Clock, Users, MapPin, Info, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Activity {
  id: string;
  emoji: string;
  name: string;
  date: string;
  time: string;
  meetingTime?: string;
  meetingPoint?: string;
  participants: number;
  duration?: string;
  details?: string[];
  notes?: string[];
  nonRefundable?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none mt-0.5 shrink-0">{activity.emoji}</span>
          <div>
            <h2 className="text-primary-foreground text-xl font-bold leading-tight">
              {activity.name}
            </h2>
            <div className="mt-2 flex items-center gap-1.5 text-primary-foreground/70">
              <Calendar className="size-3.5 shrink-0" />
              <span className="text-sm capitalize">{formatDate(activity.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Time & Participants row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hora de actividad
            </p>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{activity.time}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Participantes
            </p>
            <div className="flex items-center gap-1.5">
              <Users className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm font-semibold">{activity.participants} personas</p>
            </div>
          </div>
        </div>

        {/* Duration */}
        {activity.duration && (
          <>
            <div className="border-t" />
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Duración:</span>
              <span className="font-medium">{activity.duration}</span>
            </div>
          </>
        )}

        {/* Meeting time & point */}
        {(activity.meetingTime || activity.meetingPoint) && (
          <>
            <div className="border-t" />
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Punto de encuentro
              </p>
              {activity.meetingTime && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Presentarse a las:</span>
                  <span className="font-semibold">{activity.meetingTime}</span>
                </div>
              )}
              {activity.meetingPoint && (
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{activity.meetingPoint}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Details */}
        {activity.details && activity.details.length > 0 && (
          <>
            <div className="border-t" />
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Detalles
              </p>
              {activity.details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Notes / Important instructions */}
        {(activity.notes && activity.notes.length > 0) || activity.nonRefundable ? (
          <>
            <div className="border-t" />
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                  Instrucciones importantes
                </p>
              </div>
              {activity.nonRefundable && (
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  Esta actividad es NO reembolsable.
                </p>
              )}
              {activity.notes?.map((note, i) => (
                <p key={i} className="text-sm text-amber-800 dark:text-amber-400">
                  {note}
                </p>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Card>
  );
}
