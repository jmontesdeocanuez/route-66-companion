"use client";

import dynamic from "next/dynamic";
import type { ReferenceItemWithStatus } from "@/components/equipaje-content";
import type { UserLuggageItem } from "@/components/user-luggage-item-form-dialog";

const EquipajeContent = dynamic(
  () => import("@/components/equipaje-content").then((m) => m.EquipajeContent),
  { ssr: false }
);

interface Props {
  referenceItems: ReferenceItemWithStatus[];
  myItems: UserLuggageItem[];
  isAdmin: boolean;
}

export function EquipajeContentClient(props: Props) {
  return <EquipajeContent {...props} />;
}
