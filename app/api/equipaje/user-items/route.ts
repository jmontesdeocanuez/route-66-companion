import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST: Create a new personal item (custom or from reference)
// Body for custom: { name, category, description? }
// Body for reference: { luggageItemId, name, category, description?, status: "added" | "discarded" }
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { luggageItemId, name, category, description, status } = body;

    // Reference item interaction
    if (luggageItemId) {
      const itemStatus = status === "discarded" ? "discarded" : "added";

      // Check if a record already exists for this user+reference item
      const existing = await prisma.userLuggageItem.findFirst({
        where: { userId: session.userId, luggageItemId },
      });

      if (existing) {
        const updated = await prisma.userLuggageItem.update({
          where: { id: existing.id },
          data: {
            status: itemStatus,
            name: name || existing.name,
            category: category || existing.category,
            description: description !== undefined ? description : existing.description,
          },
        });
        return NextResponse.json(updated);
      }

      // Need name/category for "added" items; for "discarded" copy from reference
      let itemName = name;
      let itemCategory = category;
      let itemDescription = description;

      if (!itemName || !itemCategory) {
        const ref = await prisma.luggageItem.findUnique({ where: { id: luggageItemId } });
        if (!ref) {
          return NextResponse.json({ error: "Reference item not found" }, { status: 404 });
        }
        itemName = itemName || ref.name;
        itemCategory = itemCategory || ref.category;
        if (itemDescription === undefined) itemDescription = ref.description;
      }

      const created = await prisma.userLuggageItem.create({
        data: {
          userId: session.userId,
          luggageItemId,
          status: itemStatus,
          name: itemName,
          category: itemCategory,
          description: itemDescription || null,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }

    // Custom item (no luggageItemId)
    if (!name || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.userLuggageItem.create({
      data: {
        userId: session.userId,
        luggageItemId: null,
        status: "added",
        name,
        category,
        description: description || null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating user luggage item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
