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
  const refills = await prisma.fuelRefill.findMany({
    where: { carId: id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(refills);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: carId } = await params;

  try {
    const body = await request.json();
    const { date, dollars, pricePerLiter, location, km } = body;

    if (!date || !dollars || !pricePerLiter || !location) {
      return NextResponse.json(
        { error: "Fecha, dólares, precio/litro y lugar son obligatorios" },
        { status: 400 }
      );
    }

    const refill = await prisma.fuelRefill.create({
      data: {
        carId,
        date,
        dollars: Number(dollars),
        pricePerLiter: Number(pricePerLiter),
        location,
        km: km ? Number(km) : null,
      },
    });

    return NextResponse.json(refill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
