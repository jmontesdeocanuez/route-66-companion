"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Car, Fuel, Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RentalCarFormDialog, RentalCarData } from "@/components/rental-car-form-dialog";
import { FuelRefillFormDialog, FuelRefill } from "@/components/fuel-refill-form-dialog";

interface RentalCarClientProps {
  car: (RentalCarData & { refills: FuelRefill[] }) | null;
}

export function RentalCarClient({ car: initialCar }: RentalCarClientProps) {
  const router = useRouter();
  const [car, setCar] = useState(initialCar);
  const [returnKmInput, setReturnKmInput] = useState(
    initialCar?.returnKm?.toString() ?? ""
  );
  const [savingReturnKm, setSavingReturnKm] = useState(false);
  const [deletingRefillId, setDeletingRefillId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function handleCarSuccess(updatedCar: RentalCarData | null) {
    if (updatedCar === null) {
      setCar(null);
      router.refresh();
    } else {
      setCar((prev) => ({ ...updatedCar, refills: prev?.refills ?? [] }));
    }
  }

  async function handleSaveReturnKm() {
    if (!car) return;
    setSavingReturnKm(true);
    const response = await fetch(`/api/rental-car/${car.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnKm: returnKmInput ? Number(returnKmInput) : null }),
    });
    setSavingReturnKm(false);
    if (response.ok) {
      const updated = await response.json();
      setCar(updated);
    }
  }

  async function handleDeleteRefill(refillId: string) {
    if (!car) return;
    setDeletingRefillId(refillId);
    const response = await fetch(`/api/rental-car/${car.id}/refills/${refillId}`, {
      method: "DELETE",
    });
    setDeletingRefillId(null);
    if (response.ok) {
      setCar((prev) => prev ? { ...prev, refills: prev.refills.filter((r) => r.id !== refillId) } : prev);
    }
  }

  function handleRefillSuccess(refill: FuelRefill) {
    setCar((prev) => {
      if (!prev) return prev;
      const exists = prev.refills.some((r) => r.id === refill.id);
      const refills = exists
        ? prev.refills.map((r) => r.id === refill.id ? refill : r)
        : [...prev.refills, refill];
      return { ...prev, refills };
    });
  }

  // Calculations on refills sorted by date
  const refills = car?.refills ?? [];

  let accDollars = 0;
  let accLiters = 0;
  const refillRows = refills.map((r) => {
    const liters = r.dollars / r.pricePerLiter;
    accDollars += r.dollars;
    accLiters += liters;
    return { ...r, liters, accDollars, accLiters };
  });

  const totalDollars = accDollars;
  const totalLiters = accLiters;
  const totalKm =
    car?.returnKm != null && car?.pickupKm != null
      ? car.returnKm - car.pickupKm
      : null;
  const avgConsumption =
    totalKm != null && totalLiters > 0
      ? (totalLiters / totalKm) * 100
      : null;

  if (!car) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Car className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Sin coche registrado</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Registra el coche de alquiler para empezar a llevar el control de los repostajes.
          </p>
        </div>
        <RentalCarFormDialog
          trigger={
            <Button>
              <Plus className="mr-2 size-4" />
              Registrar coche
            </Button>
          }
          onSuccess={handleCarSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Car card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {car.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.imageUrl}
            alt={car.model}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xl font-bold">{car.model}</p>
              <p className="text-sm text-muted-foreground font-mono">{car.licensePlate}</p>
            </div>
            <RentalCarFormDialog
              car={car}
              trigger={
                <Button variant="ghost" size="icon" aria-label="Editar coche">
                  <Pencil className="size-4" />
                </Button>
              }
              onSuccess={handleCarSuccess}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">KM recogida</p>
              <p className="font-semibold">
                {car.pickupKm != null ? car.pickupKm.toLocaleString("es-ES") + " km" : "—"}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-1">KM entrega</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  className="h-7 text-sm font-semibold px-2"
                  placeholder="—"
                  value={returnKmInput}
                  onChange={(e) => setReturnKmInput(e.target.value)}
                  onBlur={handleSaveReturnKm}
                  disabled={savingReturnKm}
                />
              </div>
            </div>
          </div>

          {totalKm != null && (
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">KM recorridos en total</p>
              <p className="font-semibold">{totalKm.toLocaleString("es-ES")} km</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {refills.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Total gastado</p>
            <p className="text-lg font-bold">${totalDollars.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Total litros</p>
            <p className="text-lg font-bold">{totalLiters.toFixed(1)} L</p>
          </div>
          {totalKm != null && (
            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">KM recorridos</p>
              <p className="text-lg font-bold">{totalKm.toLocaleString("es-ES")} km</p>
            </div>
          )}
          {avgConsumption != null && (
            <div className="rounded-xl border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Consumo medio</p>
              <p className="text-lg font-bold">{avgConsumption.toFixed(1)} L/100km</p>
            </div>
          )}
        </div>
      )}

      {/* Refills section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fuel className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Repostajes</h2>
          </div>
          <FuelRefillFormDialog
            carId={car.id}
            trigger={
              <Button size="sm">
                <Plus className="mr-1.5 size-4" />
                Añadir
              </Button>
            }
            onSuccess={handleRefillSuccess}
          />
        </div>

        {refills.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <Fuel className="mx-auto size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Todavía no hay repostajes registrados</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Fecha</th>
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Lugar</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">KM</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">$/L</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">Litros</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">Dólares</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">Acum. $</th>
                    <th className="px-3 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">Acum. L</th>
                    <th className="px-3 py-2.5 w-8"></th>
                    <th className="px-3 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {refillRows.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {format(parse(row.date, "yyyy-MM-dd", new Date()), "d MMM", { locale: es })}
                      </td>
                      <td className="px-3 py-2.5 max-w-[140px]">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{row.location}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                        {row.km != null ? row.km.toLocaleString("es-ES") : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        ${row.pricePerLiter.toFixed(3)}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {row.liters.toFixed(1)} L
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap">
                        ${row.dollars.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                        ${row.accDollars.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                        {row.accLiters.toFixed(1)} L
                      </td>
                      <td className="px-3 py-2.5">
                        <FuelRefillFormDialog
                          carId={car.id}
                          refill={{ id: row.id, date: row.date, location: row.location, dollars: row.dollars, pricePerLiter: row.pricePerLiter, km: row.km }}
                          trigger={
                            <button
                              aria-label="Editar repostaje"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-4" />
                            </button>
                          }
                          onSuccess={handleRefillSuccess}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleDeleteRefill(row.id)}
                          disabled={deletingRefillId === row.id}
                          aria-label="Eliminar repostaje"
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 font-semibold">
                    <td colSpan={5} className="px-3 py-2.5 text-muted-foreground">
                      Total ({refills.length} repostajes)
                    </td>
                    <td className="px-3 py-2.5 text-right">${totalDollars.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right"></td>
                    <td className="px-3 py-2.5 text-right">{totalLiters.toFixed(1)} L</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
