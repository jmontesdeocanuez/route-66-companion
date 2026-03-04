import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const car = await prisma.rentalCar.findUnique({
    where: { id },
    include: { refills: { orderBy: { date: "asc" } } },
  });

  if (!car) {
    return NextResponse.json({ error: "Coche no encontrado" }, { status: 404 });
  }

  return NextResponse.json(car);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { licensePlate, model, imageUrl, pickupKm, returnKm } = body;

    const car = await prisma.rentalCar.update({
      where: { id },
      data: {
        ...(licensePlate !== undefined && { licensePlate }),
        ...(model !== undefined && { model }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(pickupKm !== undefined && { pickupKm: pickupKm ? Number(pickupKm) : null }),
        ...(returnKm !== undefined && { returnKm: returnKm ? Number(returnKm) : null }),
      },
      include: { refills: { orderBy: { date: "asc" } } },
    });

    return NextResponse.json(car);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.rentalCar.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
