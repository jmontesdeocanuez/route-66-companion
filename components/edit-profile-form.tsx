"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
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

const profileSchema = z.object({
  displayName: z.string().max(30, "Máximo 30 caracteres").optional().or(z.literal("")),
  nickname: z.string().max(30, "Máximo 30 caracteres").optional().or(z.literal("")),
  bio: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  nationality: z.string().max(50, "Máximo 50 caracteres").optional().or(z.literal("")),
  phone: z.string().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  emergencyContact: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  dietaryRestrictions: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
  allergies: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  initialValues: ProfileValues;
}

export function EditProfileForm({ initialValues }: EditProfileFormProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialValues.displayName ?? "",
      nickname: initialValues.nickname ?? "",
      bio: initialValues.bio ?? "",
      nationality: initialValues.nationality ?? "",
      phone: initialValues.phone ?? "",
      emergencyContact: initialValues.emergencyContact ?? "",
      dietaryRestrictions: initialValues.dietaryRestrictions ?? "",
      allergies: initialValues.allergies ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    setServerError(null);

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1200);
    } else {
      const data = await response.json();
      setServerError(data.error ?? "Ha ocurrido un error. Inténtalo de nuevo.");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setServerError(null);
      setSuccess(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Editar perfil
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        {success ? (
          <p className="text-sm text-center text-green-600 font-medium py-4">
            Perfil actualizado con éxito.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre para mostrar</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Jofra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apodo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: El Copiloto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobre mí</FormLabel>
                    <FormControl>
                      <Input placeholder="Una frase sobre ti" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Española" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Ej: +34 600 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto de emergencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre – Teléfono – Parentesco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restricciones alimentarias</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Vegetariana, Sin gluten" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alergias</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Penicilina, frutos secos" {...field} />
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
                {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
