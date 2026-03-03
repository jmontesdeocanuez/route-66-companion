import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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

    const flight = await prisma.flight.create({
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

    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error("Error creating flight:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
