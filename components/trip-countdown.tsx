"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(startDate: Date): TimeLeft {
  const now = new Date().getTime();
  const diff = Math.max(0, startDate.getTime() - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function getTripDay(startDate: Date, endDate: Date): number | null {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Comparar solo por fecha (sin hora)
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (now < startDate) return null; // Aún no ha empezado
  if (now > end) return -1; // Ya terminó

  const diffMs = today.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 0 = día de inicio
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface TripCountdownProps {
  startDate: Date;
  endDate: Date;
}

export function TripCountdown({ startDate, endDate }: TripCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [tripDay, setTripDay] = useState<number | null | -1>(null);

  useEffect(() => {
    const update = () => {
      setTimeLeft(getTimeLeft(startDate));
      setTripDay(getTripDay(startDate, endDate));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Viaje terminado o aún no inicializado: no mostrar nada
  if (tripDay === -1 || timeLeft === null) return null;

  const isToday = tripDay === 0;
  const inProgress = tripDay !== null && tripDay > 0;

  const units = [
    { label: "días", value: isToday ? 0 : timeLeft.days },
    { label: "horas", value: isToday ? 0 : timeLeft.hours },
    { label: "min", value: isToday ? 0 : timeLeft.minutes },
    { label: "seg", value: isToday ? 0 : timeLeft.seconds },
  ];

  return (
    <div className="animate-countdown flex flex-col items-center gap-4 text-center">
      {inProgress ? (
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
          Día {tripDay + 1} de viaje
        </p>
      ) : (
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
          {isToday ? "El momento ha llegado" : "Faltan para el viaje"}
        </p>
      )}
      {!inProgress && (
        <div className="flex items-center gap-3 sm:gap-5">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-3 sm:gap-5">
              <div className="flex flex-col items-center gap-1">
                <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary text-primary-foreground overflow-hidden">
                  <span className="text-2xl sm:text-3xl font-bold tabular-nums leading-none">
                    {pad(unit.value)}
                  </span>
                  <div className="absolute inset-x-0 top-1/2 h-px bg-primary-foreground/10" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  {unit.label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 pb-5 leading-none select-none">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {isToday && (
        <p className="max-w-sm text-base text-muted-foreground leading-relaxed">
          Miles de kilómetros de asfalto, desiertos infinitos y atardeceres que no tienen nombre os esperan.
          La Route 66 es vuestra. Disfrutad cada curva, cada parada y cada momento.{" "}
          <span className="text-foreground font-semibold">¡Buen viaje!</span>
        </p>
      )}
    </div>
  );
}
