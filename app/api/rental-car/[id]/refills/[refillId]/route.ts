import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; refillId: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { refillId } = await params;

  try {
    await prisma.fuelRefill.delete({ where: { id: refillId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
