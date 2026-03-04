"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Pencil, X, Trash2, PackageOpen, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LuggageItem, LuggageItemFormDialog } from "@/components/luggage-item-form-dialog";
import { UserLuggageItem, UserLuggageItemFormDialog } from "@/components/user-luggage-item-form-dialog";

// A reference item enriched with the current user's interaction status
export interface ReferenceItemWithStatus extends LuggageItem {
  userStatus: "added" | "discarded" | null;
}

interface Props {
  referenceItems: ReferenceItemWithStatus[];
  myItems: UserLuggageItem[];
  isAdmin: boolean;
}

function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

export function EquipajeContent({ referenceItems, myItems, isAdmin }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  // Optimistic packed state: maps item id → packed boolean
  const [packedOverrides, setPackedOverrides] = useState<Record<string, boolean>>({});

  function refresh() {
    router.refresh();
  }

  function isPacked(item: UserLuggageItem) {
    return item.id in packedOverrides ? packedOverrides[item.id] : item.packed;
  }

  async function togglePacked(item: UserLuggageItem) {
    // Optimistic update
    const next = !isPacked(item);
    setPackedOverrides((prev) => ({ ...prev, [item.id]: next }));
    const res = await fetch(`/api/equipaje/user-items/${item.id}`, { method: "PATCH" });
    if (!res.ok) {
      // Revert on error
      setPackedOverrides((prev) => ({ ...prev, [item.id]: !next }));
    }
  }

  // Visible reference items: those with no user interaction yet
  const visibleReference = referenceItems.filter((i) => i.userStatus === null);

  async function discardReferenceItem(item: LuggageItem) {
    setLoadingId(item.id);
    await fetch("/api/equipaje/user-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ luggageItemId: item.id, status: "discarded" }),
    });
    setLoadingId(null);
    refresh();
  }

  async function resetDiscarded() {
    setIsResetting(true);
    await fetch("/api/equipaje/user-items", { method: "DELETE" });
    setIsResetting(false);
    refresh();
  }

  async function removeFromMyList(userItem: UserLuggageItem) {
    setLoadingId(userItem.id);
    await fetch(`/api/equipaje/user-items/${userItem.id}`, { method: "DELETE" });
    setLoadingId(null);
    refresh();
  }

  // Sort items within a category: unpacked first, packed last
  function sortItems(items: UserLuggageItem[]) {
    return [...items].sort((a, b) => Number(isPacked(a)) - Number(isPacked(b)));
  }

  const myGrouped = groupByCategory(myItems);
  const refGrouped = groupByCategory(visibleReference);

  return (
    <div className="space-y-10">
      {/* ── MI LISTA ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold">Mi lista</h2>
            <p className="text-sm text-muted-foreground">
              {myItems.length === 0
                ? "Todavía no has añadido nada"
                : `${myItems.length} ${myItems.length === 1 ? "artículo" : "artículos"}`}
            </p>
          </div>
          <UserLuggageItemFormDialog
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4 mr-1.5" />
                Añadir propio
              </Button>
            }
            onSuccess={refresh}
          />
        </div>

        {myItems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <PackageOpen className="mx-auto size-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Añade artículos desde la lista de referencia o crea los tuyos propios.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(myGrouped).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {sortItems(items).map((item) => {
                    const packed = isPacked(item);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 rounded-lg border bg-card p-3 transition-opacity ${packed ? "opacity-40" : ""}`}
                      >
                        <button
                          onClick={() => togglePacked(item)}
                          aria-label={packed ? "Marcar como no guardado" : "Marcar como guardado"}
                          className={`mt-0.5 shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            packed
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40 hover:border-primary"
                          }`}
                        >
                          {packed && <Check className="size-3" strokeWidth={3} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium leading-snug ${packed ? "line-through" : ""}`}>{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <UserLuggageItemFormDialog
                            userItem={item}
                            trigger={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                aria-label="Editar"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            }
                            onSuccess={refresh}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            aria-label="Quitar de mi lista"
                            disabled={loadingId === item.id}
                            onClick={() => removeFromMyList(item)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── LISTA DE REFERENCIA ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold">Lista de referencia</h2>
            <p className="text-sm text-muted-foreground">
              {visibleReference.length === 0
                ? "No hay artículos pendientes"
                : `${visibleReference.length} ${visibleReference.length === 1 ? "artículo disponible" : "artículos disponibles"}`}
            </p>
          </div>
          {isAdmin && (
            <LuggageItemFormDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="size-4 mr-1.5" />
                  Añadir a referencia
                </Button>
              }
              onSuccess={refresh}
            />
          )}
        </div>

        {visibleReference.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Has revisado todos los artículos de la lista de referencia.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(refGrouped).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium leading-snug">{item.name}</p>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <UserLuggageItemFormDialog
                          referenceItem={item}
                          trigger={
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 px-3 text-xs"
                              disabled={loadingId === item.id}
                            >
                              Añadir
                            </Button>
                          }
                          onSuccess={refresh}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          aria-label="Descartar"
                          disabled={loadingId === item.id}
                          onClick={() => discardReferenceItem(item)}
                        >
                          <X className="size-4" />
                        </Button>
                        {isAdmin && (
                          <LuggageItemFormDialog
                            item={item}
                            trigger={
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-muted-foreground hover:text-foreground"
                                aria-label="Editar artículo de referencia"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            }
                            onSuccess={refresh}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {referenceItems.some((i) => i.userStatus === "discarded") && (
          <div className="pt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs gap-1.5"
              disabled={isResetting}
              onClick={resetDiscarded}
            >
              <RotateCcw className="size-3.5" />
              {isResetting ? "Restableciendo..." : "Restablecer artículos descartados"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
