import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: { id: string; sortOrder: number }[] };

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map(({ id, sortOrder }) =>
        prisma.itineraryItem.update({ where: { id }, data: { sortOrder } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering itinerary items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
