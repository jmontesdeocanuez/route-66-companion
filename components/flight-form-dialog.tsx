"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Flight } from "@/components/flight-card";

const CABIN_CLASSES = [
  "Turista",
  "Turista Premium",
  "Business",
  "Primera",
] as const;

const flightSchema = z.object({
  airline: z.string().min(1, "La aerolínea es obligatoria"),
  flightNumber: z.string().min(1, "El número de vuelo es obligatorio"),
  originCode: z.string().min(2, "Código IATA obligatorio").max(4),
  originCity: z.string().min(1, "La ciudad de origen es obligatoria"),
  originCountry: z.string().min(1, "El país de origen es obligatorio"),
  destinationCode: z.string().min(2, "Código IATA obligatorio").max(4),
  destinationCity: z.string().min(1, "La ciudad de destino es obligatoria"),
  destinationCountry: z.string().min(1, "El país de destino es obligatorio"),
  departureDate: z.string().min(1, "La fecha de salida es obligatoria"),
  departureTime: z.string().min(1, "La hora de salida es obligatoria"),
  arrivalDate: z.string().min(1, "La fecha de llegada es obligatoria"),
  arrivalTime: z.string().min(1, "La hora de llegada es obligatoria"),
  duration: z.string().min(1, "La duración es obligatoria"),
  cabinClass: z.string().min(1, "La clase es obligatoria"),
  passengers: z.coerce.number().int().min(1, "Mínimo 1 pasajero"),
  sortOrder: z.coerce.number().int().optional(),
});

type FlightFormValues = z.infer<typeof flightSchema>;

interface FlightFormDialogProps {
  flight?: Flight;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function FlightFormDialog({ flight, trigger, onSuccess }: FlightFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!flight;

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      airline: flight?.airline ?? "",
      flightNumber: flight?.flightNumber ?? "",
      originCode: flight?.originCode ?? "",
      originCity: flight?.originCity ?? "",
      originCountry: flight?.originCountry ?? "",
      destinationCode: flight?.destinationCode ?? "",
      destinationCity: flight?.destinationCity ?? "",
      destinationCountry: flight?.destinationCountry ?? "",
      departureDate: flight?.departureDate ?? "",
      departureTime: flight?.departureTime ?? "",
      arrivalDate: flight?.arrivalDate ?? "",
      arrivalTime: flight?.arrivalTime ?? "",
      duration: flight?.duration ?? "",
      cabinClass: flight?.cabinClass ?? "",
      passengers: flight?.passengers ?? 2,
      sortOrder: flight?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: FlightFormValues) {
    setServerError(null);

    const payload = {
      ...values,
      flightIata: values.flightNumber.replace(/\s/g, ""),
    };

    const url = isEditing ? `/api/flights/${flight.id}` : "/api/flights";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setOpen(false);
      onSuccess();
    } else {
      const data = await response.json();
      setServerError(data.error ?? "Ha ocurrido un error. Inténtalo de nuevo.");
    }
  }

  async function handleDelete() {
    if (!flight) return;
    setIsDeleting(true);
    const response = await fetch(`/api/flights/${flight.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (response.ok) {
      setOpen(false);
      onSuccess();
    } else {
      setServerError("No se ha podido borrar el vuelo. Inténtalo de nuevo.");
      setConfirmDelete(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setServerError(null);
      setConfirmDelete(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar vuelo" : "Añadir vuelo"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Airline & Flight number */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="airline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aerolínea</FormLabel>
                    <FormControl>
                      <Input placeholder="Iberia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° vuelo</FormLabel>
                    <FormControl>
                      <Input placeholder="IB 6251" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Origin */}
            <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
              <FormField
                control={form.control}
                name="originCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IATA</FormLabel>
                    <FormControl>
                      <Input placeholder="MAD" maxLength={4} className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad origen</FormLabel>
                    <FormControl>
                      <Input placeholder="Madrid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="España" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Destination */}
            <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
              <FormField
                control={form.control}
                name="destinationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IATA</FormLabel>
                    <FormControl>
                      <Input placeholder="ORD" maxLength={4} className="uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad destino</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicago" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Estados Unidos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Departure */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha salida</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora salida</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Arrival */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha llegada</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arrivalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora llegada</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration & Class */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración</FormLabel>
                    <FormControl>
                      <Input placeholder="9h 50m" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cabinClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clase</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona clase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CABIN_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers & Sort order */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasajeros</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {serverError && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || isDeleting}>
              {form.formState.isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Añadir vuelo"}
            </Button>

            {isEditing && (
              confirmDelete ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Borrando..." : "Confirmar borrado"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => setConfirmDelete(true)}
                >
                  Borrar vuelo
                </Button>
              )
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
