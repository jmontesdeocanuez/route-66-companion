import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, location, mapsQuery, time, imageUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const stop = await prisma.stop.update({
      where: { id },
      data: {
        title,
        description: description || null,
        location: location || null,
        mapsQuery: mapsQuery || null,
        time: time || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(stop);
  } catch (error) {
    console.error("Error updating stop:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
