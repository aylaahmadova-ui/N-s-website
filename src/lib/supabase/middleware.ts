import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasAuth = Boolean(request.cookies.get("pb_auth")?.value);

  if (!hasAuth && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/apply"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
