import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed, sortOrder, date } = body;

    const data: Record<string, unknown> = {};
    if (completed !== undefined) data.completed = completed;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (date !== undefined) data.date = new Date(date);

    const item = await prisma.itineraryItem.update({
      where: { id },
      data,
      include: { flight: true, hotel: true, stop: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating itinerary item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.itineraryItem.delete({
      where: { id },
      select: { type: true, stopId: true },
    });
    if (item.type === "stop" && item.stopId) {
      await prisma.stop.delete({ where: { id: item.stopId } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting itinerary item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
