import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  let { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", data.user.id).maybeSingle();

  // Self-heal accounts that exist in auth but don't yet have an app profile.
  if (!profile) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", data.user.id)
      .limit(1);

    const metadataRole =
      data.user.user_metadata?.account_type === "organization" ||
      data.user.user_metadata?.account_type === "supporter"
        ? data.user.user_metadata.account_type
        : null;

    const inferredRole = metadataRole ?? (membership && membership.length > 0 ? "organization" : "supporter");
    const inferredName =
      (data.user.user_metadata?.full_name as string | undefined) ??
      data.user.email?.split("@")[0] ??
      "Kindora User";

    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: inferredName,
      role: inferredRole,
    });

    profile = { role: inferredRole, full_name: inferredName };
  }

  const redirectTo = profile.role === "admin" ? "/admin" : profile.role === "organization" ? "/dashboard" : "/profile";

  return NextResponse.json({ ok: true, redirectTo });
}
