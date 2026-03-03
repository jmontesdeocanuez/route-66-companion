"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";

interface DayNavigatorProps {
  currentDate: Date;
  startDate: Date;
  endDate: Date;
  onDateChange: (date: Date) => void;
}

export function DayNavigator({ currentDate, startDate, endDate, onDateChange }: DayNavigatorProps) {
  const dayNumber = differenceInCalendarDays(currentDate, startDate) + 1;
  const isFirst = differenceInCalendarDays(currentDate, startDate) <= 0;
  const isLast = differenceInCalendarDays(currentDate, endDate) >= 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(addDays(currentDate, -1))}
        disabled={isFirst}
        aria-label="Día anterior"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="text-center">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Día {dayNumber}
        </p>
        <p className="text-base font-medium">
          {(() => {
            const str = format(currentDate, "EEEE d 'de' MMMM", { locale: es });
            // Capitalize only the first letter, leave rest as-is (date-fns/es returns lowercase)
            const [weekday, ...rest] = str.split(" ");
            const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            // Insert comma after weekday: "Viernes, 20 de marzo"
            return `${capitalized}, ${rest.join(" ")}`;
          })()}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(addDays(currentDate, 1))}
        disabled={isLast}
        aria-label="Día siguiente"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  );
}
