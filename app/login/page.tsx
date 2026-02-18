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
    <main className="flex min-h-svh items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
