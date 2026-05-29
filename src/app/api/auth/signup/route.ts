import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validation";

function getSignupErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("email") && (message.includes("exists") || message.includes("unique"))) {
      return "Account already exists. Please sign in.";
    }
    if (message.includes("failed to create record")) {
      return "Could not create account. Please check your details and try again.";
    }
    return error.message;
  }
  return "Sign up failed.";
}

export async function POST(request: Request) {
  try {
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
    let createdUser: { id: string };
    try {
      createdUser = (await supabase.pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name: fullName,
        emailVisibility: true,
      })) as { id: string };
    } catch (createError) {
      const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
      const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
      if (!adminEmail || !adminPassword) {
        return NextResponse.json(
          {
            error: `${getSignupErrorMessage(createError)} Ask admin to allow users create rule or set POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD in .env.local.`,
          },
          { status: 400 },
        );
      }

      const adminPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090");
      await adminPb.collection("_superusers").authWithPassword(adminEmail, adminPassword);
      createdUser = (await adminPb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name: fullName,
        emailVisibility: true,
      })) as { id: string };
    }

    const role = accountType === "organization" ? "organization" : "supporter";

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: createdUser.id,
      full_name: fullName,
      role,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (accountType === "organization") {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .insert({
          legal_name: organizationName,
          display_name: organizationName,
          description: organizationMission ?? "Pending application details",
          website: null,
          contact_email: email,
          status: "pending",
          created_by: createdUser.id,
        })
        .select("id")
        .single();

      if (organizationError) {
        return NextResponse.json({ error: organizationError.message }, { status: 400 });
      }

      if (organization) {
        const { error: memberError } = await supabase.from("organization_members").insert({
          organization_id: organization.id,
          user_id: createdUser.id,
          role: "owner",
        });

        if (memberError) {
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
  } catch (error) {
    return NextResponse.json(
      { error: getSignupErrorMessage(error) },
      { status: 500 },
    );
  }
}
