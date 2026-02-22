import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, city, boardPlan, rooms, roomType, checkIn, nights, imageUrl, resortFeePerRoomPerNight } = body;

    if (!name || !city || !boardPlan || !rooms || !roomType || !checkIn || !nights) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city,
        boardPlan,
        rooms: Number(rooms),
        roomType,
        checkIn: new Date(checkIn),
        nights: Number(nights),
        imageUrl: imageUrl || null,
        resortFeePerRoomPerNight: resortFeePerRoomPerNight ? Number(resortFeePerRoomPerNight) : null,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
