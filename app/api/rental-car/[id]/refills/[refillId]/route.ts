import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; refillId: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { refillId } = await params;

  try {
    const body = await request.json();
    const { date, dollars, pricePerLiter, location, km } = body;

    if (!date || !dollars || !pricePerLiter || !location) {
      return NextResponse.json(
        { error: "Fecha, dólares, precio/litro y lugar son obligatorios" },
        { status: 400 }
      );
    }

    const refill = await prisma.fuelRefill.update({
      where: { id: refillId },
      data: {
        date,
        dollars: Number(dollars),
        pricePerLiter: Number(pricePerLiter),
        location,
        km: km ? Number(km) : null,
      },
    });

    return NextResponse.json(refill);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

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
