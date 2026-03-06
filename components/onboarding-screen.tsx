"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/avatar-upload";
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

interface OnboardingScreenProps {
  userName: string;
  avatar: string | null;
  initialProfile: ProfileValues;
}

type Step = "welcome" | "profile" | "celebration";

function Route66Shield() {
  return (
    <div className="mx-auto mb-6 w-14 h-[4.25rem] flex flex-col items-center justify-center rounded-b-full border-[3px] border-foreground px-2 shrink-0">
      <span className="text-[6.5px] font-black tracking-widest text-foreground uppercase leading-none mt-1">
        US ROUTE
      </span>
      <span className="text-2xl font-black text-foreground leading-none">66</span>
    </div>
  );
}

export function OnboardingScreen({ userName, avatar, initialProfile }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [visibleLines, setVisibleLines] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [celebrationLine, setCelebrationLine] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const displayName = initialProfile.displayName || userName;

  const welcomeLines = [
    { text: `Hola, ${displayName}`, muted: false },
    { text: "Estás a punto de iniciar el viaje que todos llevamos soñando.", muted: true },
    { text: "La Ruta 66. La Madre de todas las carreteras.", muted: false },
    { text: "4.000 km de asfalto, historia y libertad.", muted: true },
    { text: "Antes de arrancar, cuéntanos un poco sobre ti.", muted: false },
  ];

  const celebrationLines = [
    { text: "¡Todo listo!", large: true, muted: false },
    { text: `${displayName}, la Ruta 66 ya es tuya.`, large: false, muted: false },
    { text: "Que el horizonte sea siempre tu destino.", large: false, muted: true },
  ];

  useEffect(() => {
    if (step !== "welcome") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    welcomeLines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 200 + i * 900));
    });
    timers.push(
      setTimeout(() => setShowContinue(true), 200 + welcomeLines.length * 900 + 300)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== "celebration") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    celebrationLines.forEach((_, i) => {
      timers.push(setTimeout(() => setCelebrationLine(i + 1), 200 + i * 900));
    });
    timers.push(
      setTimeout(() => router.push("/"), 200 + celebrationLines.length * 900 + 2500)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialProfile.displayName ?? "",
      nickname: initialProfile.nickname ?? "",
      bio: initialProfile.bio ?? "",
      nationality: initialProfile.nationality ?? "",
      phone: initialProfile.phone ?? "",
      emergencyContact: initialProfile.emergencyContact ?? "",
      dietaryRestrictions: initialProfile.dietaryRestrictions ?? "",
      allergies: initialProfile.allergies ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    setServerError(null);

    const profileRes = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!profileRes.ok) {
      const data = await profileRes.json();
      setServerError(data.error ?? "Ha ocurrido un error. Inténtalo de nuevo.");
      return;
    }

    await fetch("/api/user/onboarding", { method: "POST" });
    setStep("celebration");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">

      {/* ── Phase 1: Welcome ── */}
      {step === "welcome" && (
        <div className="w-full max-w-sm text-center space-y-6">
          <Route66Shield />

          <div className="space-y-3">
            {welcomeLines.map((line, i) => (
              <p
                key={i}
                className={[
                  "transition-all duration-700 ease-out",
                  visibleLines > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  i === 0
                    ? "text-2xl font-bold tracking-tight text-foreground"
                    : line.muted
                      ? "text-sm text-muted-foreground"
                      : "text-sm font-medium text-foreground",
                ].join(" ")}
              >
                {line.text}
              </p>
            ))}
          </div>

          <div
            className={[
              "transition-all duration-700 ease-out",
              showContinue ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            ].join(" ")}
          >
            <Button className="w-full" onClick={() => setStep("profile")}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* ── Phase 2: Profile ── */}
      {step === "profile" && (
        <Card className="w-full max-w-sm max-h-[90vh] overflow-y-auto animate-welcome-greeting">
          <CardHeader className="items-center text-center">
            <AvatarUpload name={userName} avatar={avatar} size="lg" />
            <CardTitle className="text-2xl">Cuéntanos sobre ti</CardTitle>
            <CardDescription>
              Modifica a tu gusto — siempre podrás editarlo desde tu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <Input type="tel" placeholder="+34 600 000 000" {...field} />
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
                        <Input placeholder="Ej: Sin gluten, vegetariana" {...field} />
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
                  {form.formState.isSubmitting ? "Guardando..." : "¡Listo, que empiece el viaje!"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* ── Phase 3: Celebration ── */}
      {step === "celebration" && (
        <div className="w-full max-w-sm text-center space-y-4">
          <Route66Shield />
          {celebrationLines.map((line, i) => (
            <p
              key={i}
              className={[
                "transition-all duration-700 ease-out",
                celebrationLine > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                line.large
                  ? "text-3xl font-bold tracking-tight text-foreground"
                  : line.muted
                    ? "text-sm text-muted-foreground"
                    : "text-base font-medium text-foreground",
              ].join(" ")}
            >
              {line.text}
            </p>
          ))}
        </div>
      )}

    </main>
  );
}
