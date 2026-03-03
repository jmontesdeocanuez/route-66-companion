import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      airline, flightNumber, flightIata,
      originCode, originCity, originCountry,
      destinationCode, destinationCity, destinationCountry,
      departureDate, departureTime, arrivalDate, arrivalTime,
      duration, cabinClass, passengers, sortOrder,
    } = body;

    if (!airline || !flightNumber || !originCode || !destinationCode || !departureDate || !departureTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const flight = await prisma.flight.update({
      where: { id },
      data: {
        airline,
        flightNumber,
        flightIata: flightIata || flightNumber.replace(/\s/g, ""),
        originCode,
        originCity,
        originCountry,
        destinationCode,
        destinationCity,
        destinationCountry,
        departureDate,
        departureTime,
        arrivalDate,
        arrivalTime,
        duration,
        cabinClass,
        passengers: Number(passengers),
        sortOrder: Number(sortOrder || 0),
      },
    });

    return NextResponse.json(flight);
  } catch (error) {
    console.error("Error updating flight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.flight.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting flight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
