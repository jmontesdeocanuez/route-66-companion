import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Iniciar sesión — Route 66 Companion",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/");
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Route 66 branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg w-20 h-24 shadow-md">
            <span className="text-[10px] font-bold tracking-[0.25em] leading-none mt-1">US ROUTE</span>
            <span className="text-5xl font-black leading-none font-display">66</span>
          </div>
          <div className="text-center space-y-2">
            <p className="font-display font-bold tracking-widest text-sm uppercase text-muted-foreground">
              Tu compañero de viaje
            </p>
            <div className="road-separator" />
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
