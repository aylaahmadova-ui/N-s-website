import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") && pathname !== "/admin/unlock") {
    const passcode = process.env.ADMIN_PASSCODE;
    const token = request.cookies.get("destekly_admin")?.value;
    if (!passcode || token !== passcode) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unlock";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
