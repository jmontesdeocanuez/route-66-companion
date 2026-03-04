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
import { LUGGAGE_CATEGORIES, LuggageItem } from "@/components/luggage-item-form-dialog";

export interface UserLuggageItem {
  id: string;
  luggageItemId: string | null;
  name: string;
  category: string;
  description: string | null;
  status: string;
}

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  // If provided: editing an existing personal item
  userItem?: UserLuggageItem;
  // If provided: adding from a reference item (dialog pre-fills with reference data)
  referenceItem?: LuggageItem;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

export function UserLuggageItemFormDialog({ userItem, referenceItem, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!userItem;
  const fromReference = !!referenceItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: userItem?.name ?? referenceItem?.name ?? "",
      category: userItem?.category ?? referenceItem?.category ?? "",
      description: userItem?.description ?? referenceItem?.description ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const payload = {
      name: values.name,
      category: values.category,
      description: values.description || null,
    };

    let url: string;
    let method: string;

    if (isEditing) {
      url = `/api/equipaje/user-items/${userItem.id}`;
      method = "PUT";
    } else if (fromReference) {
      url = "/api/equipaje/user-items";
      method = "POST";
      Object.assign(payload, { luggageItemId: referenceItem.id, status: "added" });
    } else {
      url = "/api/equipaje/user-items";
      method = "POST";
    }

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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset({
        name: userItem?.name ?? referenceItem?.name ?? "",
        category: userItem?.category ?? referenceItem?.category ?? "",
        description: userItem?.description ?? referenceItem?.description ?? "",
      });
      setServerError(null);
    }
  }

  let title: string;
  if (isEditing) title = "Editar artículo";
  else if (fromReference) title = "Añadir a mi lista";
  else title = "Añadir artículo propio";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {fromReference && !isEditing && (
          <p className="text-sm text-muted-foreground -mt-2">
            Puedes modificar el nombre y los detalles antes de añadirlo a tu lista.
          </p>
        )}

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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormLabel>Notas <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      placeholder="Cualquier nota personal sobre este artículo..."
                      className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      {...field}
                    />
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

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Añadir a mi lista"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
