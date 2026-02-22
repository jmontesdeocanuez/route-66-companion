"use client";

import { useState } from "react";
import { Phone, AlertTriangle, Globe, UserRound, KeyRound, Loader2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Viajero {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  avatar: string | null;
  nickname: string | null;
  bio: string | null;
  nationality: string | null;
  phone: string | null;
  emergencyContact: string | null;
  dietaryRestrictions: string | null;
  allergies: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ViajeroCard({ viajero, isAdmin }: { viajero: Viajero; isAdmin?: boolean }) {
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleReset() {
    setResetting(true);
    setResetError(null);
    try {
      const res = await fetch(`/api/admin/reset-password/${viajero.id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      setResetDone(true);
    } catch {
      setResetError("Error al restablecer. Inténtalo de nuevo.");
    } finally {
      setResetting(false);
    }
  }

  const displayName = viajero.displayName ?? viajero.name;
  const hasContact = viajero.phone || viajero.emergencyContact;
  const hasInfo = viajero.nationality;
  const hasRestrictions = viajero.dietaryRestrictions || viajero.allergies;

  return (
    <Card className="overflow-hidden p-0 gap-0">
      {/* Header */}
      <div className="bg-primary px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground text-sm font-semibold select-none">
            {viajero.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viajero.avatar} alt={displayName} className="size-12 rounded-full object-cover" />
            ) : (
              getInitials(viajero.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-primary-foreground text-xl font-bold leading-tight">
              {displayName}
            </h2>
            <p className="mt-0.5 text-sm text-primary-foreground/70 truncate">{viajero.name}</p>
            {viajero.nickname && (
              <p className="mt-1 text-sm italic text-primary-foreground/60">&ldquo;{viajero.nickname}&rdquo;</p>
            )}
            {viajero.bio && (
              <p className="mt-1.5 text-sm text-primary-foreground/80 leading-snug">{viajero.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Contacto */}
        {hasContact && (
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contacto
            </p>
            {viajero.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${viajero.phone.replace(/\s/g, "")}`}
                  className="font-medium hover:underline"
                >
                  {viajero.phone}
                </a>
              </div>
            )}
            {viajero.emergencyContact && (
              <div className="flex items-start gap-2.5 text-sm">
                <UserRound className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Emergencia: </span>
                  <span className="font-medium">{viajero.emergencyContact}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información del viaje */}
        {hasInfo && (
          <>
            {hasContact && <div className="border-t" />}
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Información
              </p>
              {viajero.nationality && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{viajero.nationality}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Restricciones alimentarias / alergias */}
        {hasRestrictions && (
          <>
            {(hasContact || hasInfo) && <div className="border-t" />}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                  Restricciones alimentarias
                </p>
              </div>
              {viajero.dietaryRestrictions && (
                <p className="text-sm text-amber-800 dark:text-amber-400">{viajero.dietaryRestrictions}</p>
              )}
              {viajero.allergies && (
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  <span className="font-semibold">Alergias: </span>
                  {viajero.allergies}
                </p>
              )}
            </div>
          </>
        )}

        {/* Fallback si no hay ningún dato adicional */}
        {!hasContact && !hasInfo && !hasRestrictions && (
          <p className="text-sm text-muted-foreground italic">Sin información adicional</p>
        )}

        {/* Acciones de administrador */}
        {isAdmin && (
          <>
            <div className="border-t" />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={resetting || resetDone}
                className="text-muted-foreground"
              >
                {resetting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : resetDone ? (
                  <Check className="size-3.5 text-green-600" />
                ) : (
                  <KeyRound className="size-3.5" />
                )}
                {resetDone ? "Contraseña restablecida" : "Restablecer contraseña"}
              </Button>
              {resetError && (
                <p className="text-xs text-destructive">{resetError}</p>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
