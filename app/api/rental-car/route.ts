import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cars = await prisma.rentalCar.findMany({
    orderBy: { createdAt: "asc" },
    include: { refills: { orderBy: { date: "asc" } } },
  });

  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { licensePlate, model, imageUrl, pickupKm } = body;

    if (!licensePlate || !model) {
      return NextResponse.json(
        { error: "La matrícula y el modelo son obligatorios" },
        { status: 400 }
      );
    }

    const car = await prisma.rentalCar.create({
      data: {
        licensePlate,
        model,
        imageUrl: imageUrl || null,
        pickupKm: pickupKm ? Number(pickupKm) : null,
      },
      include: { refills: true },
    });

    return NextResponse.json(car, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
