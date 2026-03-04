import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { emoji, name, date, time, meetingTime, meetingPoint, participants, duration, details, notes, nonRefundable, sortOrder } = body;

    if (!emoji || !name || !date || !time || !participants) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const excursion = await prisma.excursion.create({
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

    return NextResponse.json(excursion, { status: 201 });
  } catch (error) {
    console.error("Error creating excursion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
