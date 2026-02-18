import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always run bcrypt.compare to prevent timing attacks
    const dummyHash =
      "$2a$12$LCKx.qpFRW.gBvSWLbgxpO4.BNLuQrSSPsGcXBHl9bK4/nQLp0G2u";
    const passwordToCheck = user?.password ?? dummyHash;
    const isValid = await bcrypt.compare(password, passwordToCheck);

    if (!user || !isValid) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    session.userId = user.id;
    session.name = user.name;
    session.email = user.email;
    session.isLoggedIn = true;
    session.mustChangePassword = user.mustChangePassword;

    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
