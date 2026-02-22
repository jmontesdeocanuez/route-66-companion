import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const allowedFields = [
      "displayName",
      "nickname",
      "bio",
      "nationality",
      "phone",
      "emergencyContact",
      "dietaryRestrictions",
      "allergies",
    ] as const;

    type AllowedField = (typeof allowedFields)[number];

    const data: Partial<Record<AllowedField, string | null>> = {};
    for (const field of allowedFields) {
      if (field in body) {
        const value = body[field];
        data[field] = typeof value === "string" && value.trim() !== "" ? value.trim() : null;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: {
        displayName: true,
        nickname: true,
        bio: true,
        nationality: true,
        phone: true,
        emergencyContact: true,
        dietaryRestrictions: true,
        allergies: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
