import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const fallbackRole =
    user.user_metadata?.account_type === "organization" || user.user_metadata?.account_type === "supporter"
      ? user.user_metadata.account_type
      : null;
  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Destekly User";

  const resolvedProfile =
    profile ??
    ({
      id: user.id,
      full_name: fallbackName,
      role: fallbackRole,
    } as { id: string; full_name: string; role: Role | null });

  return {
    user,
    profile: resolvedProfile,
  };
}

export async function requireAuth() {
  const current = await getCurrentUser();
  if (!current) redirect("/auth/login");
  return current;
}

export async function requireRole(roles: Role[]) {
  const current = await requireAuth();
  if (!current.profile || !roles.includes(current.profile.role as Role)) {
    redirect("/");
  }

  return current;
}
