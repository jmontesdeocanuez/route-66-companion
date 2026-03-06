"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  initialProfile: ProfileValues;
}

type Step = "welcome" | "profile" | "celebration";

const ROUTE66_SHIELD = (
  <div className="mx-auto mb-8 w-16 h-20 flex flex-col items-center justify-center rounded-b-full border-4 border-amber-400/80 bg-transparent px-2">
    <span className="text-[7px] font-black tracking-widest text-amber-400/80 uppercase leading-none mt-1">
      US ROUTE
    </span>
    <span className="text-3xl font-black text-amber-400 leading-none">66</span>
  </div>
);

export function OnboardingScreen({ userName, initialProfile }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [visibleLines, setVisibleLines] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [celebrationLine, setCelebrationLine] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const displayName = initialProfile.displayName || userName;

  const welcomeLines: { text: string; size: "xl" | "lg" | "base"; color: "white" | "amber" | "muted" }[] = [
    { text: `Hola, ${displayName}`, size: "xl", color: "white" },
    { text: "Estás a punto de iniciar el viaje que todos llevamos soñando.", size: "base", color: "muted" },
    { text: "La Ruta 66.", size: "lg", color: "amber" },
    { text: "La Madre de todas las carreteras.", size: "base", color: "amber" },
    { text: "4.000 km de asfalto, historia y libertad absoluta.", size: "base", color: "muted" },
    { text: "Antes de arrancar, cuéntanos un poco sobre ti.", size: "base", color: "white" },
  ];

  const celebrationLines: { text: string; size: "2xl" | "xl" | "lg"; color: "white" | "amber" | "muted" }[] = [
    { text: "¡Todo listo!", size: "2xl", color: "white" },
    { text: `${displayName}, la Ruta 66 ya es tuya.`, size: "xl", color: "amber" },
    { text: "Que el horizonte sea siempre tu destino.", size: "lg", color: "muted" },
  ];

  useEffect(() => {
    if (step !== "welcome") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    welcomeLines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 300 + i * 900));
    });
    timers.push(
      setTimeout(() => setShowContinue(true), 300 + welcomeLines.length * 900 + 400)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== "celebration") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    celebrationLines.forEach((_, i) => {
      timers.push(setTimeout(() => setCelebrationLine(i + 1), 300 + i * 1000));
    });
    timers.push(
      setTimeout(
        () => router.push("/"),
        300 + celebrationLines.length * 1000 + 2800
      )
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

  const inputClass =
    "bg-white/8 border-white/20 text-white placeholder:text-white/25 focus-visible:ring-amber-400/50 focus-visible:border-amber-400/50";
  const labelClass = "text-white/60 text-xs font-medium";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto onboarding-bg">
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">

        {/* ── Phase 1: Welcome ── */}
        {step === "welcome" && (
          <div className="w-full max-w-lg text-center">
            {ROUTE66_SHIELD}

            <div className="space-y-4">
              {welcomeLines.map((line, i) => (
                <p
                  key={i}
                  style={{ transitionDelay: `0ms` }}
                  className={[
                    "transition-all duration-700 ease-out",
                    visibleLines > i
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5",
                    line.size === "xl"
                      ? "text-3xl sm:text-4xl font-bold tracking-tight text-white"
                      : line.size === "lg"
                        ? "text-xl sm:text-2xl font-semibold"
                        : "text-base sm:text-lg",
                    line.color === "amber"
                      ? "text-amber-400 animate-onboarding-glow"
                      : line.color === "muted"
                        ? "text-white/55"
                        : "text-white",
                  ].join(" ")}
                >
                  {line.text}
                </p>
              ))}
            </div>

            <div
              className={[
                "transition-all duration-700 ease-out mt-12",
                showContinue ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
              ].join(" ")}
            >
              <Button
                onClick={() => setStep("profile")}
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-black font-bold px-10 text-base rounded-full shadow-lg shadow-amber-900/40 transition-colors"
              >
                Comenzar el viaje →
              </Button>
            </div>
          </div>
        )}

        {/* ── Phase 2: Profile ── */}
        {step === "profile" && (
          <div className="w-full max-w-md animate-onboarding-fade-in">
            <div className="text-center mb-7">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Cuéntanos sobre ti
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Esto es lo que sabemos de ti — modifica a tu gusto y confirma
                cuando estés listo.
              </p>
            </div>

            <div className="bg-white/6 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/12 shadow-2xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Nombre para mostrar</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Jofra" className={inputClass} {...field} />
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
                          <FormLabel className={labelClass}>Apodo</FormLabel>
                          <FormControl>
                            <Input placeholder="El Copiloto" className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Sobre mí</FormLabel>
                        <FormControl>
                          <Input placeholder="Una frase sobre ti" className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Nacionalidad</FormLabel>
                          <FormControl>
                            <Input placeholder="Española" className={inputClass} {...field} />
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
                          <FormLabel className={labelClass}>Teléfono</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+34 600 000 000" className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Contacto de emergencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre – Teléfono – Parentesco" className={inputClass} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Restricciones alimentarias</FormLabel>
                          <FormControl>
                            <Input placeholder="Sin gluten, vegana..." className={inputClass} {...field} />
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
                          <FormLabel className={labelClass}>Alergias</FormLabel>
                          <FormControl>
                            <Input placeholder="Penicilina, frutos secos..." className={inputClass} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {serverError && (
                    <p className="text-sm font-medium text-red-400" role="alert">
                      {serverError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-black font-bold rounded-full shadow-lg shadow-amber-900/40 transition-colors mt-1"
                  >
                    {form.formState.isSubmitting
                      ? "Guardando..."
                      : "¡Listo, que empiece el viaje! →"}
                  </Button>
                </form>
              </Form>
            </div>

            <p className="text-center text-white/30 text-xs mt-4">
              Siempre podrás modificar esto desde tu página de perfil.
            </p>
          </div>
        )}

        {/* ── Phase 3: Celebration ── */}
        {step === "celebration" && (
          <div className="w-full max-w-lg text-center space-y-5">
            {ROUTE66_SHIELD}
            {celebrationLines.map((line, i) => (
              <p
                key={i}
                className={[
                  "transition-all duration-700 ease-out",
                  celebrationLine > i
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5",
                  line.size === "2xl"
                    ? "text-4xl sm:text-5xl font-black tracking-tight"
                    : line.size === "xl"
                      ? "text-2xl sm:text-3xl font-bold"
                      : "text-lg sm:text-xl",
                  line.color === "amber"
                    ? "text-amber-400 animate-onboarding-glow"
                    : line.color === "muted"
                      ? "text-white/55"
                      : "text-white",
                ].join(" ")}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
