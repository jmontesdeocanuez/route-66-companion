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

export const LUGGAGE_CATEGORIES = [
  "Documentos",
  "Ropa",
  "Electrónica",
  "Higiene",
  "Medicamentos",
  "Accesorios",
  "Otros",
] as const;

export interface LuggageItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  sortOrder: number;
}

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  item?: LuggageItem;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function LuggageItemFormDialog({ item, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditing = !!item;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? "",
      category: item?.category ?? "",
      description: item?.description ?? "",
      sortOrder: item?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const url = isEditing ? `/api/equipaje/items/${item.id}` : "/api/equipaje/items";
    const method = isEditing ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        category: values.category,
        description: values.description || null,
        sortOrder: values.sortOrder ?? 0,
      }),
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
    if (!item) return;
    setIsDeleting(true);
    const response = await fetch(`/api/equipaje/items/${item.id}`, { method: "DELETE" });
    setIsDeleting(false);
    if (response.ok) {
      setOpen(false);
      onSuccess();
    } else {
      setServerError("No se ha podido borrar el artículo. Inténtalo de nuevo.");
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
          <DialogTitle>{isEditing ? "Editar artículo" : "Añadir artículo a la lista de referencia"}</DialogTitle>
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
                    <Input placeholder="Pasaporte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LUGGAGE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      placeholder="Notas adicionales sobre este artículo..."
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
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" {...field} />
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
                  : "Añadir artículo"}
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
                  Borrar artículo
                </Button>
              )
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
