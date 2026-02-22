"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConversorCardProps {
  title: string;
  emoji: string;
  leftLabel: string;
  rightLabel: string;
  defaultLeft: number;
  toRight: (val: number) => number;
  toLeft: (val: number) => number;
  formatLeft?: (val: number) => string;
  formatRight?: (val: number) => string;
  note?: string;
}

export function ConversorCard({
  title,
  emoji,
  leftLabel,
  rightLabel,
  defaultLeft,
  toRight,
  toLeft,
  formatLeft,
  formatRight,
  note,
}: ConversorCardProps) {
  const [leftVal, setLeftVal] = useState(String(defaultLeft));
  const [rightVal, setRightVal] = useState(() => {
    const r = toRight(defaultLeft);
    return formatRight ? formatRight(r) : String(Math.round(r * 100) / 100);
  });

  function handleLeftChange(raw: string) {
    setLeftVal(raw);
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      const r = toRight(n);
      setRightVal(formatRight ? formatRight(r) : String(Math.round(r * 100) / 100));
    } else {
      setRightVal("");
    }
  }

  function handleRightChange(raw: string) {
    setRightVal(raw);
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      const l = toLeft(n);
      setLeftVal(formatLeft ? formatLeft(l) : String(Math.round(l * 100) / 100));
    } else {
      setLeftVal("");
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>{emoji}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{leftLabel}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={leftVal}
              onChange={(e) => handleLeftChange(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{rightLabel}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={rightVal}
              onChange={(e) => handleRightChange(e.target.value)}
              className="text-base"
            />
          </div>
        </div>
        {note && (
          <p className="text-xs text-muted-foreground">{note}</p>
        )}
      </CardContent>
    </Card>
  );
}
