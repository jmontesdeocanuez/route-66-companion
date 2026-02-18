import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ForceChangePasswordForm } from "@/components/force-change-password-form";

export default async function CambiarContrasenaPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  if (!session.mustChangePassword) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Cambia tu contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Por seguridad, debes establecer una nueva contraseña antes de
            continuar.
          </p>
        </div>

        <ForceChangePasswordForm />
      </div>
    </main>
  );
}
