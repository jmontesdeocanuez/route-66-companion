import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

// Paths accessible while mustChangePassword is true (besides PUBLIC_PATHS)
const CHANGE_PASSWORD_PATHS = [
  "/cambiar-contrasena",
  "/api/user/password",
  "/api/auth/logout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.mustChangePassword) {
    const isAllowed = CHANGE_PASSWORD_PATHS.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/cambiar-contrasena", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
