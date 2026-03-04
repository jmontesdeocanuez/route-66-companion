import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PUT: Edit a personal item (name, category, description)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, category, description } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure item belongs to current user
    const existing = await prisma.userLuggageItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.userLuggageItem.update({
      where: { id },
      data: { name, category, description: description || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user luggage item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove a personal item
// - If it came from a reference item (luggageItemId set): sets status to "discarded"
//   so the reference item stays hidden for this user
// - If custom (luggageItemId null): deletes the record
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.userLuggageItem.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.luggageItemId) {
      // From reference: mark as discarded instead of deleting
      await prisma.userLuggageItem.update({
        where: { id },
        data: { status: "discarded" },
      });
    } else {
      // Custom item: delete completely
      await prisma.userLuggageItem.delete({ where: { id } });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error removing user luggage item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
