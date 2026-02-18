import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
  redirect("/login");
}

export default async function Home() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Route 66 Companion</h1>
        <p className="text-xl text-muted-foreground">
          Bienvenido, {session.name}!
        </p>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="text-sm underline text-muted-foreground hover:text-foreground transition-colors"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
