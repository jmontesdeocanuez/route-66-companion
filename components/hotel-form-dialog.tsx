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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hotel } from "@/components/hotel-card";

const BOARD_PLANS = [
  "Solo alojamiento",
  "Alojamiento y desayuno",
  "Media pensión",
  "Pensión completa",
] as const;

const hotelSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  checkIn: z.string().min(1, "La fecha de entrada es obligatoria"),
  nights: z.coerce.number().int().min(1, "Mínimo 1 noche"),
  rooms: z.coerce.number().int().min(1, "Mínimo 1 habitación"),
  roomType: z.string().min(1, "El tipo de habitación es obligatorio"),
  boardPlan: z.string().min(1, "El régimen es obligatorio"),
  imageUrl: z.string().url("URL no válida").or(z.literal("")).optional(),
  resortFeePerRoomPerNight: z.coerce.number().int().min(0).optional().or(z.literal("")),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

interface HotelFormDialogProps {
  hotel?: Hotel;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function HotelFormDialog({ hotel, trigger, onSuccess }: HotelFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!hotel;

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: hotel?.name ?? "",
      city: hotel?.city ?? "",
      checkIn: hotel?.checkIn ?? "",
      nights: hotel?.nights ?? 1,
      rooms: hotel?.rooms ?? 4,
      roomType: hotel?.roomType ?? "",
      boardPlan: hotel?.boardPlan ?? "",
      imageUrl: hotel?.imageUrl ?? "",
      resortFeePerRoomPerNight: hotel?.resortFee?.pricePerRoomPerNight ?? "",
    },
  });

  async function onSubmit(values: HotelFormValues) {
    setServerError(null);

    const payload = {
      name: values.name,
      city: values.city,
      checkIn: values.checkIn,
      nights: values.nights,
      rooms: values.rooms,
      roomType: values.roomType,
      boardPlan: values.boardPlan,
      imageUrl: values.imageUrl || null,
      resortFeePerRoomPerNight: values.resortFeePerRoomPerNight || null,
    };

    const url = isEditing ? `/api/hotels/${hotel.id}` : "/api/hotels";
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
    if (!hotel) return;
    setIsDeleting(true);
    const response = await fetch(`/api/hotels/${hotel.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (response.ok) {
      setOpen(false);
      onSuccess();
    } else {
      setServerError("No se ha podido borrar el hotel. Inténtalo de nuevo.");
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
          <DialogTitle>{isEditing ? "Editar hotel" : "Añadir hotel"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <textarea
                        rows={2}
                        placeholder="Warwick Allerton Chicago"
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicago" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="boardPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régimen</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un régimen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOARD_PLANS.map((plan) => (
                          <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
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
                name="nights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Noches</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de habitación</FormLabel>
                    <FormControl>
                      <Input placeholder="1 King Bed Non-Smoking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habitaciones</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resortFeePerRoomPerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resort fee ($/hab·noche)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="Opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  : "Añadir hotel"}
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
                  Borrar hotel
                </Button>
              )
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
