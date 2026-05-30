import { NextResponse } from "next/server";
import { adminCookieName, getAdminPasscode } from "@/lib/admin-access";

export async function POST(request: Request) {
  const { passcode } = (await request.json()) as { passcode?: string };
  const expected = getAdminPasscode();

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSCODE is not configured." }, { status: 500 });
  }

  if (!passcode || passcode !== expected) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
