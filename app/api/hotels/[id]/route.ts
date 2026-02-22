import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, city, boardPlan, rooms, roomType, checkIn, nights, imageUrl, resortFeePerRoomPerNight } = body;

    if (!name || !city || !boardPlan || !rooms || !roomType || !checkIn || !nights) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hotel = await prisma.hotel.update({
      where: { id },
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

    return NextResponse.json(hotel);
  } catch (error) {
    console.error("Error updating hotel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.hotel.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
