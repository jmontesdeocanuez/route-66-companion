import { prisma } from "@/lib/prisma";

export async function getTripConfig() {
  return prisma.tripConfig.findUniqueOrThrow({ where: { key: "default" } });
}
