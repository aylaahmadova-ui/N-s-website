import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/dashboard";
import type { Role } from "@/lib/types";

export async function getApiContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null, organization: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const metadataRole =
    user.user_metadata?.account_type === "admin" ||
    user.user_metadata?.account_type === "organization" ||
    user.user_metadata?.account_type === "supporter"
      ? (user.user_metadata.account_type as Role)
      : null;
  const resolvedRole = (profile?.role as Role | null) ?? metadataRole;

  // If role exists in metadata but profile row is missing, self-heal for future requests.
  if (!profile && resolvedRole) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Kindora User";
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      role: resolvedRole,
    });
  }

  const organization = await getOrganizationContext(user.id);

  return { supabase, user, profile, organization, role: resolvedRole };
}

export function hasRole(role: unknown, allowed: Role[]) {
  return typeof role === "string" && allowed.includes(role as Role);
}
