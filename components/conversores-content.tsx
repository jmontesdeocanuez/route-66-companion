"use client";

import { ConversorCard } from "@/components/conversor-card";
import { CurrencyConversor } from "@/components/currency-conversor";
import { AlturaConversor } from "@/components/altura-conversor";

export function ConversoresContent() {
  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Conversores</h1>
          <p className="text-muted-foreground">
            Conversiones útiles para el viaje a Estados Unidos
          </p>
        </div>

        <div className="space-y-4">
          {/* Divisa — tipo de cambio en tiempo real */}
          <CurrencyConversor />

          {/* Temperatura */}
          <ConversorCard
            title="Temperatura"
            emoji="🌡️"
            leftLabel="Celsius (°C)"
            rightLabel="Fahrenheit (°F)"
            defaultLeft={25}
            toRight={(c) => (c * 9) / 5 + 32}
            toLeft={(f) => ((f - 32) * 5) / 9}
            note="El verano en la Ruta 66 puede superar los 40 °C (104 °F). El cuerpo humano en reposo tolera hasta ~37 °C."
          />

          {/* Velocidad */}
          <ConversorCard
            title="Velocidad"
            emoji="🚗"
            leftLabel="km/h"
            rightLabel="mph"
            defaultLeft={120}
            toRight={(kmh) => kmh / 1.60934}
            toLeft={(mph) => mph * 1.60934}
            note="El límite en autopistas interestatal suele ser 65–75 mph (104–120 km/h). En ciudad, 25–35 mph (40–56 km/h)."
          />

          {/* Distancia */}
          <ConversorCard
            title="Distancia"
            emoji="📍"
            leftLabel="Kilómetros (km)"
            rightLabel="Millas (mi)"
            defaultLeft={100}
            toRight={(km) => km / 1.60934}
            toLeft={(mi) => mi * 1.60934}
            note="1 milla = 1,609 km. La Ruta 66 mide ~3.940 km (2.448 millas) en total."
          />

          {/* Peso */}
          <ConversorCard
            title="Peso"
            emoji="⚖️"
            leftLabel="Kilogramos (kg)"
            rightLabel="Libras (lbs)"
            defaultLeft={70}
            toRight={(kg) => kg * 2.20462}
            toLeft={(lbs) => lbs / 2.20462}
            note="Útil para conocer tu peso en básculas americanas o límites de equipaje en libras."
          />

          {/* Longitud / Altura */}
          <AlturaConversor />

          {/* Volumen — gasolina */}
          <ConversorCard
            title="Volumen (combustible)"
            emoji="⛽"
            leftLabel="Litros (L)"
            rightLabel="Galones (gal)"
            defaultLeft={50}
            toRight={(l) => l / 3.78541}
            toLeft={(gal) => gal * 3.78541}
            note="La gasolina se vende en galones en EE. UU. 1 galón = 3,785 L. El precio suele indicarse por galón."
          />

          {/* Propina */}
          <ConversorCard
            title="Calculadora de propina"
            emoji="🤝"
            leftLabel="Cuenta total ($)"
            rightLabel="Propina 18% ($)"
            defaultLeft={50}
            toRight={(total) => Math.round(total * 0.18 * 100) / 100}
            toLeft={(tip) => Math.round((tip / 0.18) * 100) / 100}
            note="En EE. UU. la propina es prácticamente obligatoria: 15% mínimo, 18–20% habitual, 25% excelente. Se da en restaurantes, taxis, peluquerías…"
          />
        </div>
      </div>
    </main>
  );
}
