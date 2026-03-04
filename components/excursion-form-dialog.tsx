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
import { Activity } from "@/components/activity-card";

const excursionSchema = z.object({
  emoji: z.string().min(1, "El emoji es obligatorio"),
  name: z.string().min(1, "El nombre es obligatorio"),
  date: z.string().min(1, "La fecha es obligatoria"),
  time: z.string().min(1, "La hora es obligatoria"),
  meetingTime: z.string().optional().or(z.literal("")),
  meetingPoint: z.string().optional().or(z.literal("")),
  participants: z.coerce.number().int().min(1, "Mínimo 1 participante"),
  duration: z.string().optional().or(z.literal("")),
  details: z.string().optional(),
  notes: z.string().optional(),
  nonRefundable: z.string(),
  sortOrder: z.coerce.number().int(),
});

type ExcursionFormValues = z.infer<typeof excursionSchema>;

interface ExcursionFormDialogProps {
  excursion?: Activity & { sortOrder?: number };
  trigger: React.ReactNode;
  onSuccess: () => void;
}

function linesToArray(text: string | undefined): string[] {
  if (!text) return [];
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function arrayToLines(arr: string[] | undefined): string {
  if (!arr || arr.length === 0) return "";
  return arr.join("\n");
}

export function ExcursionFormDialog({ excursion, trigger, onSuccess }: ExcursionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!excursion;

  const form = useForm<ExcursionFormValues>({
    resolver: zodResolver(excursionSchema),
    defaultValues: {
      emoji: excursion?.emoji ?? "",
      name: excursion?.name ?? "",
      date: excursion?.date ?? "",
      time: excursion?.time ?? "",
      meetingTime: excursion?.meetingTime ?? "",
      meetingPoint: excursion?.meetingPoint ?? "",
      participants: excursion?.participants ?? 7,
      duration: excursion?.duration ?? "",
      details: arrayToLines(excursion?.details),
      notes: arrayToLines(excursion?.notes),
      nonRefundable: excursion?.nonRefundable ? "true" : "false",
      sortOrder: excursion?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: ExcursionFormValues) {
    setServerError(null);

    const payload = {
      emoji: values.emoji,
      name: values.name,
      date: values.date,
      time: values.time,
      meetingTime: values.meetingTime || null,
      meetingPoint: values.meetingPoint || null,
      participants: values.participants,
      duration: values.duration || null,
      details: linesToArray(values.details),
      notes: linesToArray(values.notes),
      nonRefundable: values.nonRefundable === "true",
      sortOrder: values.sortOrder,
    };

    const url = isEditing ? `/api/excursiones/${excursion.id}` : "/api/excursiones";
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
    if (!excursion) return;
    setIsDeleting(true);
    const response = await fetch(`/api/excursiones/${excursion.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (response.ok) {
      setOpen(false);
      onSuccess();
    } else {
      setServerError("No se ha podido borrar la excursión. Inténtalo de nuevo.");
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
          <DialogTitle>{isEditing ? "Editar excursión" : "Añadir excursión"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="🚁" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <textarea
                        rows={2}
                        placeholder="Excursión en helicóptero al Gran Cañón"
                        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participantes</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de actividad</FormLabel>
                    <FormControl>
                      <Input placeholder="09:05" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="25–30 minutos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meetingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presentarse a las (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="08:35" {...field} />
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
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="meetingPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Punto de encuentro (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="3568 Airport Rd, Grand Canyon Village..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles (opcional, uno por línea)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder={"Vuelo en helicóptero modelo EcoStar.\nEl recorrido incluye traslado."}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones importantes (opcional, una por línea)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={3}
                      placeholder={"Llegar al menos 45 minutos antes.\nEs indispensable presentar el bono."}
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
              name="nonRefundable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Es no reembolsable?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Sí — actividad no reembolsable</SelectItem>
                    </SelectContent>
                  </Select>
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
                  : "Añadir excursión"}
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
                  Borrar excursión
                </Button>
              )
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
