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

const carSchema = z.object({
  licensePlate: z.string().min(1, "La matrícula es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  imageUrl: z.string().url("URL no válida").or(z.literal("")).optional(),
  pickupKm: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

type CarFormValues = z.infer<typeof carSchema>;

export interface RentalCarData {
  id: string;
  licensePlate: string;
  model: string;
  imageUrl: string | null;
  pickupKm: number | null;
  returnKm: number | null;
}

interface RentalCarFormDialogProps {
  car?: RentalCarData;
  trigger: React.ReactNode;
  onSuccess: (car: RentalCarData | null) => void;
}

export function RentalCarFormDialog({ car, trigger, onSuccess }: RentalCarFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!car;

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      licensePlate: car?.licensePlate ?? "",
      model: car?.model ?? "",
      imageUrl: car?.imageUrl ?? "",
      pickupKm: car?.pickupKm ?? "",
    },
  });

  async function onSubmit(values: CarFormValues) {
    setServerError(null);

    const payload = {
      licensePlate: values.licensePlate,
      model: values.model,
      imageUrl: values.imageUrl || null,
      pickupKm: values.pickupKm || null,
    };

    const url = isEditing ? `/api/rental-car/${car.id}` : "/api/rental-car";
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

  async function handleDelete() {
    if (!car) return;
    setIsDeleting(true);
    const response = await fetch(`/api/rental-car/${car.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (response.ok) {
      setOpen(false);
      onSuccess(null);
    } else {
      setServerError("No se ha podido borrar el coche. Inténtalo de nuevo.");
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

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar coche de alquiler" : "Registrar coche de alquiler"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ford Mustang" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://... (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KM al recoger el coche</FormLabel>
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
              disabled={form.formState.isSubmitting || isDeleting}
            >
              {form.formState.isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar coche"}
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
                  Dar de baja el coche
                </Button>
              )
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
