import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ViajeroCard, Viajero } from "@/components/viajero-card";

export const metadata = {
  title: "Viajeros — Route 66 Companion",
};

export default async function ViajerosPage() {
  const session = await getSession();

  const currentUser = session.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isAdmin: true },
      })
    : null;

  const isAdmin = currentUser?.isAdmin ?? false;

  const viajeros = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      avatar: true,
      nickname: true,
      bio: true,
      nationality: true,
      phone: true,
      emergencyContact: true,
      dietaryRestrictions: true,
      allergies: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="page-header space-y-1">
          <h1 className="text-3xl font-bold font-display tracking-wide">Viajeros</h1>
          <p className="text-muted-foreground">
            Los {viajeros.length} aventureros de la Ruta 66
          </p>
        </div>
        <div className="space-y-4">
          {viajeros.map((v) => (
            <ViajeroCard key={v.id} viajero={v as Viajero} isAdmin={isAdmin} />
          ))}
        </div>
      </div>
    </main>
  );
}
