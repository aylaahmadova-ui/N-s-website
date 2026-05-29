import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await supabase.pb.collection("users").delete(user.id);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete account." },
      { status: 400 },
    );
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true, redirectTo: "/auth/signup" });
}
