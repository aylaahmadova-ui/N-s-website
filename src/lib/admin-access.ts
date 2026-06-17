import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const ADMIN_COOKIE = "destekly_admin";

export function getAdminPasscode() {
  return (process.env.ADMIN_PASSCODE ?? "").trim();
}

export async function isAdminUnlocked() {
  const passcode = getAdminPasscode();
  if (!passcode) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token !== passcode) return false;

  // Ensure the user actually has an active session (profile)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
}

export async function requireAdminPageAccess() {
  if (!(await isAdminUnlocked())) {
    redirect("/admin/unlock");
  }
}

export async function requireAdminApiAccess() {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return null;
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}
