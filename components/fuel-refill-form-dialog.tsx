"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const refillSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  location: z.string().min(1, "El lugar es obligatorio"),
  dollars: z.coerce.number().positive("Debe ser mayor que 0"),
  pricePerLiter: z.coerce.number().positive("Debe ser mayor que 0"),
  km: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

type RefillFormValues = z.infer<typeof refillSchema>;

export interface FuelRefill {
  id: string;
  date: string;
  location: string;
  dollars: number;
  pricePerLiter: number;
  km: number | null;
}

interface FuelRefillFormDialogProps {
  carId: string;
  refill?: FuelRefill;
  trigger: React.ReactNode;
  onSuccess: (refill: FuelRefill) => void;
}

export function FuelRefillFormDialog({ carId, refill, trigger, onSuccess }: FuelRefillFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!refill;

  const form = useForm<RefillFormValues>({
    resolver: zodResolver(refillSchema),
    defaultValues: {
      date: refill?.date ?? format(new Date(), "yyyy-MM-dd"),
      location: refill?.location ?? "",
      dollars: refill?.dollars ?? ("" as unknown as number),
      pricePerLiter: refill?.pricePerLiter ?? ("" as unknown as number),
      km: refill?.km ?? "",
    },
  });

  async function onSubmit(values: RefillFormValues) {
    setServerError(null);

    const payload = {
      date: values.date,
      location: values.location,
      dollars: values.dollars,
      pricePerLiter: values.pricePerLiter,
      km: values.km || null,
    };

    const url = isEditing
      ? `/api/rental-car/${carId}/refills/${refill.id}`
      : `/api/rental-car/${carId}/refills`;
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      setOpen(false);
      onSuccess(data);
    } else {
      const data = await response.json();
      setServerError(data.error ?? "Ha ocurrido un error. Inténtalo de nuevo.");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({
        date: refill?.date ?? format(new Date(), "yyyy-MM-dd"),
        location: refill?.location ?? "",
        dollars: refill?.dollars ?? ("" as unknown as number),
        pricePerLiter: refill?.pricePerLiter ?? ("" as unknown as number),
        km: refill?.km ?? "",
      });
      setServerError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar repostaje" : "Añadir repostaje"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          data-empty={!field.value}
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(parse(field.value, "yyyy-MM-dd", new Date()), "d MMM yyyy", { locale: es })
                            : "Selecciona una fecha"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={es}
                        selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar</FormLabel>
                  <FormControl>
                    <Input placeholder="Flagstaff, AZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dollars"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dólares ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" placeholder="45.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerLiter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio/litro ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.001" placeholder="1.058" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KM en el momento del repostaje</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0 (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Añadir repostaje"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
