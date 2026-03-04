"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";

interface DayNavigatorProps {
  dates: Date[];
  startDate: Date;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function formatDayLabel(date: Date): string {
  const str = format(date, "EEEE d 'de' MMMM", { locale: es });
  const [weekday, ...rest] = str.split(" ");
  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized}, ${rest.join(" ")}`;
}

export function DayNavigator({ dates, startDate, isFirst, isLast, onPrev, onNext }: DayNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Días anteriores"
        className="shrink-0"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="flex flex-1 gap-2">
        {dates.map((date) => {
          const dayNumber = differenceInCalendarDays(date, startDate) + 1;
          return (
            <div key={date.toISOString()} className="flex-1 text-center min-w-0">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Día {dayNumber}
              </p>
              <p className="text-sm font-medium truncate">
                {formatDayLabel(date)}
              </p>
            </div>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={isLast}
        aria-label="Días siguientes"
        className="shrink-0"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
