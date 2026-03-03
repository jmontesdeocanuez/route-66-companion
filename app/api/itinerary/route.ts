import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "date parameter is required" }, { status: 400 });
    }

    const date = new Date(dateParam);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const items = await prisma.itineraryItem.findMany({
      where: {
        date: { gte: date, lt: nextDay },
      },
      include: {
        flight: true,
        hotel: true,
        stop: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, type, flightId, hotelId, stopId, stop } = body;

    if (!date || !type) {
      return NextResponse.json({ error: "date and type are required" }, { status: 400 });
    }

    const itemDate = new Date(date);
    const nextDay = new Date(itemDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const maxOrder = await prisma.itineraryItem.findFirst({
      where: { date: { gte: itemDate, lt: nextDay } },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxOrder?.sortOrder ?? -1) + 1;

    let resolvedStopId = stopId;

    if (type === "stop" && !stopId && stop) {
      const newStop = await prisma.stop.create({
        data: {
          title: stop.title,
          description: stop.description || null,
          location: stop.location || null,
          time: stop.time || null,
          imageUrl: stop.imageUrl || null,
        },
      });
      resolvedStopId = newStop.id;
    }

    const item = await prisma.itineraryItem.create({
      data: {
        date: itemDate,
        type,
        sortOrder: nextSortOrder,
        flightId: type === "flight" ? flightId : null,
        hotelId: type === "hotel" ? hotelId : null,
        stopId: type === "stop" ? resolvedStopId : null,
      },
      include: {
        flight: true,
        hotel: true,
        stop: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
