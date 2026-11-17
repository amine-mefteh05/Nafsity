import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { authSecret, SESSION_COOKIE } from "@/lib/secret";

// First line of defence only. Every page and action re-checks authorization server-side.
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let role: string | null = null;
  if (token) { try { role = ((await jwtVerify(token, authSecret())).payload as { role?: string }).role ?? null; } catch {} }
  const login = () => NextResponse.redirect(new URL("/login", req.url));
  if (!role) return login();
  if (path.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  if (path.startsWith("/pro") && role !== "PSYCHOLOGIST") return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/psychologists/:path*", "/appointments/:path*", "/exercises/:path*", "/mood/:path*", "/journal/:path*", "/challenges/:path*", "/progress/:path*", "/relax/:path*", "/inspiration/:path*", "/assistant/:path*", "/notifications/:path*", "/profile/:path*", "/subscription/:path*", "/pro/:path*", "/admin/:path*"],
};
