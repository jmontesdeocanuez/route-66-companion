"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CurrencyConversor() {
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const [euros, setEuros] = useState("50");
  const [dollars, setDollars] = useState("");

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((data) => {
        setRate(data.rate);
        setRateDate(data.date ?? null);
        setIsFallback(!!data.fallback);
        setDollars(String(Math.round(50 * data.rate * 100) / 100));
      })
      .catch(() => {
        setRate(1.08);
        setIsFallback(true);
        setDollars(String(Math.round(50 * 1.08 * 100) / 100));
      });
  }, []);

  function handleEurosChange(raw: string) {
    setEuros(raw);
    if (rate !== null) {
      const n = parseFloat(raw);
      setDollars(isNaN(n) ? "" : String(Math.round(n * rate * 100) / 100));
    }
  }

  function handleDollarsChange(raw: string) {
    setDollars(raw);
    if (rate !== null) {
      const n = parseFloat(raw);
      setEuros(isNaN(n) ? "" : String(Math.round((n / rate) * 100) / 100));
    }
  }

  const loading = rate === null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>💶</span>
          Divisas (EUR → USD)
          {!loading && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              1 € = {rate?.toFixed(4)} $
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Euros (€)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={euros}
              onChange={(e) => handleEurosChange(e.target.value)}
              disabled={loading}
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Dólares ($)</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={dollars}
              onChange={(e) => handleDollarsChange(e.target.value)}
              disabled={loading}
              className="text-base"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {loading && "Cargando tipo de cambio…"}
          {!loading && isFallback && "⚠️ No se pudo obtener el tipo de cambio en tiempo real. Usando valor aproximado (1 € ≈ 1,08 $)."}
          {!loading && !isFallback && rateDate && `Tipo de cambio del Banco Central Europeo (${rateDate}). Recuerda que al pagar con tarjeta puede aplicarse una comisión adicional.`}
        </p>
      </CardContent>
    </Card>
  );
}
