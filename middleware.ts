import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require auth session refresh (everything else is public)
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/apply", "/admin", "/api"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin passcode check (runs before session refresh for speed)
  if (pathname.startsWith("/admin") && pathname !== "/admin/unlock") {
    const passcode = process.env.ADMIN_PASSCODE?.trim();
    const token = request.cookies.get("destekly_admin")?.value;
    if (!passcode || token !== passcode) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unlock";
      return NextResponse.redirect(url);
    }
  }

  // Skip the expensive auth session refresh for public routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Only refresh Supabase auth session for protected routes
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
