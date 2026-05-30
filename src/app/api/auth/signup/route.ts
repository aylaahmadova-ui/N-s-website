import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = signUpSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sign up data." }, { status: 400 });
  }

  const { fullName, email, password, accountType, organizationName, organizationMission } = parsed.data;

  if (accountType === "organization" && !organizationName) {
    return NextResponse.json({ error: "Organization name is required for organization accounts." }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      account_type: accountType,
    },
  });

  if (createError || !createdUser.user) {
    return NextResponse.json({ error: createError?.message ?? "Could not create user." }, { status: 400 });
  }

  const role = accountType === "organization" ? "organization" : "supporter";

  const { error: profileError } = await admin.from("profiles").upsert({
    id: createdUser.user.id,
    full_name: fullName,
    role,
  });

  const isMissingProfilesTable = profileError?.message?.includes("public.profiles");
  if (profileError && !isMissingProfilesTable) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (accountType === "organization") {
    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .insert({
        legal_name: organizationName,
        display_name: organizationName,
        description: organizationMission ?? "Pending application details",
        website: null,
        contact_email: email,
        status: "pending",
        created_by: createdUser.user.id,
      })
      .select("id")
      .single();

    const isMissingOrganizationsTable = organizationError?.message?.includes("public.organizations");
    if (organizationError && !isMissingOrganizationsTable) {
      return NextResponse.json({ error: organizationError.message }, { status: 400 });
    }

    if (organization) {
      const { error: memberError } = await admin.from("organization_members").insert({
        organization_id: organization.id,
        user_id: createdUser.user.id,
        role: "owner",
      });

      const isMissingMembersTable = memberError?.message?.includes("public.organization_members");
      if (memberError && !isMissingMembersTable) {
        return NextResponse.json({ error: memberError.message }, { status: 400 });
      }
    }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    redirectTo: role === "organization" ? "/dashboard" : "/profile",
  });
}
