import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { emoji, name, date, time, meetingTime, meetingPoint, participants, duration, details, notes, nonRefundable, sortOrder } = body;

    if (!emoji || !name || !date || !time || !participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const excursion = await prisma.excursion.update({
      where: { id },
      data: {
        emoji,
        name,
        date,
        time,
        meetingTime: meetingTime || null,
        meetingPoint: meetingPoint || null,
        participants: Number(participants),
        duration: duration || null,
        details: details ?? [],
        notes: notes ?? [],
        nonRefundable: Boolean(nonRefundable),
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    return NextResponse.json(excursion);
  } catch (error) {
    console.error("Error updating excursion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.excursion.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting excursion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
