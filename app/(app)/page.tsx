import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 pt-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Route 66 Companion</h1>
        <p className="text-xl text-muted-foreground">
          Bienvenido, {session.name}!
        </p>
      </div>
    </main>
  );
}
