import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { onboardingCompleted: true },
    });

    session.onboardingCompleted = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding completion error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
