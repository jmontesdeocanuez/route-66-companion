"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { differenceInCalendarDays } from "date-fns";

const MESSAGES = [
  { emoji: "🌅", text: "¡Día completado! Os merecéis un buen descanso después de tantos kilómetros." },
  { emoji: "🛣️", text: "¡Todo listo por hoy! La Ruta 66 seguirá ahí mañana. Ahora a recargar pilas, equipo." },
  { emoji: "⭐", text: "¡Lo habéis dado todo hoy! El sofá del hotel os llama a gritos." },
  { emoji: "🌵", text: "Día completado, viajeros. El desierto también descansa por la noche." },
  { emoji: "🎸", text: "¡Rock & roll, día cerrado! Que el descanso de hoy alimente el viaje de mañana." },
  { emoji: "🏁", text: "¡Meta del día alcanzada! Poneos cómodos, que mañana hay más aventura." },
  { emoji: "🌙", text: "Día cerrado con éxito. Las estrellas de esta noche son solo vuestras." },
  { emoji: "🤠", text: "¡Yeehaw! Otro día conquistado. Descansad, cowboys, que el camino es largo." },
  { emoji: "🗺️", text: "¡Misión cumplida! Guardad fuerzas para seguir descubriendo esta ruta legendaria." },
  { emoji: "☕", text: "Día completado. Ahora toca relajarse juntos con algo rico y revivir los momentos del día." },
  { emoji: "🌄", text: "¡Increíble jornada! El horizonte de mañana os espera. Por hoy, a descansar." },
  { emoji: "🎯", text: "¡Bullseye! Todo el plan del día completado. Sois una máquina." },
  { emoji: "🦅", text: "Voláis alto, viajeros. Día completo. Ahora aterrizad y descansad." },
  { emoji: "🏜️", text: "El desierto os ha visto hoy. Mañana volverá a veros, pero descansad primero." },
  { emoji: "🚗", text: "Motor apagado por hoy. ¡Menudo día! A descansar, que el coche también lo necesita." },
  { emoji: "✨", text: "¡Día brillante, completado al 100%! Que el descanso de esta noche sea tan épico como el viaje." },
  { emoji: "🌠", text: "Todas las tareas del día, tachadas. Cerrad los ojos y soñad con el tramo de mañana." },
  { emoji: "🎉", text: "¡Celebrad este día! Lo habéis completado entero. Mañana habrá más razones para alegrarse." },
  { emoji: "🛤️", text: "¡Un día más de Ruta 66 en el bolsillo! Descansad fuerte, equipo." },
  { emoji: "💪", text: "¡Qué crack el equipo! Día entero completado. El descanso de hoy es parte del viaje de mañana." },
];

interface ItineraryDayCompleteProps {
  currentDate: Date;
  tripStartDate: Date;
}

export function ItineraryDayComplete({ currentDate, tripStartDate }: ItineraryDayCompleteProps) {
  const firedRef = useRef(false);

  // Pick a deterministic message based on the day number
  const dayIndex = Math.abs(differenceInCalendarDays(currentDate, tripStartDate));
  const message = MESSAGES[dayIndex % MESSAGES.length];

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors: ["#a78bfa", "#60a5fa", "#34d399"],
        gravity: 1.2,
        scalar: 0.9,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors: ["#f59e0b", "#fb7185", "#a78bfa"],
        gravity: 1.2,
        scalar: 0.9,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <span className="text-5xl">{message.emoji}</span>
      <p className="text-center text-base font-medium max-w-xs leading-relaxed">
        {message.text}
      </p>
    </div>
  );
}
