import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ReferenceItemWithStatus } from "@/components/equipaje-content";
import { UserLuggageItem } from "@/components/user-luggage-item-form-dialog";
import { EquipajeContentClient } from "@/components/equipaje-content-client";

export const metadata = {
  title: "Mi Equipaje — Route 66 Companion",
};

export default async function EquipajePage() {
  const session = await getSession();

  const [currentUser, allLuggageItems, userInteractions] = await Promise.all([
    session.userId
      ? prisma.user.findUnique({
          where: { id: session.userId },
          select: { isAdmin: true },
        })
      : null,
    prisma.luggageItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    session.userId
      ? prisma.userLuggageItem.findMany({
          where: { userId: session.userId },
        })
      : [],
  ]);

  const isAdmin = currentUser?.isAdmin ?? false;

  // Build a map of luggageItemId → user interaction for quick lookup
  const interactionByRefId = new Map(
    userInteractions
      .filter((i) => i.luggageItemId !== null)
      .map((i) => [i.luggageItemId!, i])
  );

  // Enrich reference items with user status
  const referenceItems: ReferenceItemWithStatus[] = allLuggageItems.map((item) => {
    const interaction = interactionByRefId.get(item.id);
    return {
      ...item,
      userStatus: interaction
        ? (interaction.status as "added" | "discarded")
        : null,
    };
  });

  // User's personal items: status "added" only
  const myItems: UserLuggageItem[] = userInteractions
    .filter((i) => i.status === "added")
    .map((i) => ({
      id: i.id,
      luggageItemId: i.luggageItemId,
      name: i.name,
      category: i.category,
      description: i.description,
      status: i.status,
      packed: i.packed,
    }));

  return (
    <main className="min-h-svh px-4 pb-10 pt-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Mi Equipaje</h1>
          <p className="text-muted-foreground">
            Tu lista personal para el viaje
          </p>
        </div>
        <EquipajeContentClient
          referenceItems={referenceItems}
          myItems={myItems}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}
