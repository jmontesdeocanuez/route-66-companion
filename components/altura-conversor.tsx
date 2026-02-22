"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AlturaConversor() {
  const [cm, setCm] = useState("175");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");

  function cmToFeetInches(cmVal: number) {
    const totalInches = cmVal / 2.54;
    const f = Math.floor(totalInches / 12);
    const i = Math.round(totalInches % 12);
    // If rounding inches reaches 12, carry over to feet
    if (i === 12) return { feet: f + 1, inches: 0 };
    return { feet: f, inches: i };
  }

  function feetInchesToCm(f: number, i: number) {
    return Math.round((f * 30.48 + i * 2.54) * 10) / 10;
  }

  function handleCmChange(raw: string) {
    setCm(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0) {
      const { feet: f, inches: i } = cmToFeetInches(n);
      setFeet(String(f));
      setInches(String(i));
    }
  }

  function handleFeetChange(raw: string) {
    setFeet(raw);
    const f = parseFloat(raw);
    const i = parseFloat(inches);
    if (!isNaN(f) && !isNaN(i)) {
      setCm(String(feetInchesToCm(f, i)));
    }
  }

  function handleInchesChange(raw: string) {
    setInches(raw);
    const f = parseFloat(feet);
    const i = parseFloat(raw);
    if (!isNaN(f) && !isNaN(i)) {
      setCm(String(feetInchesToCm(f, i)));
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>📏</span>
          Longitud / Altura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Centímetros (cm)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={cm}
              onChange={(e) => handleCmChange(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pies (ft)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={feet}
              onChange={(e) => handleFeetChange(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pulgadas (in)</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              value={inches}
              onChange={(e) => handleInchesChange(e.target.value)}
              className="text-base"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          El formato americano es pies′pulgadas″. Ej: 175 cm = 5′9″. Las tallas de ropa usan este sistema.
        </p>
      </CardContent>
    </Card>
  );
}
