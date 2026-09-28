import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

const schema = z.object({
  status: z.enum(["approved", "rejected", "pending"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
  const supabase = createAdminClient();

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
  }

  const { id } = await params;
  const nextStatus = parsed.data.status;

  const { data: current, error: readError } = await supabase
    .from("organizations")
    .select("status")
    .eq("id", id)
    .single();

  if (readError || !current) {
    return NextResponse.json({ error: "Organization not found." }, { status: 404 });
  }

  const previousStatus = current.status as string;
  if (previousStatus === nextStatus) {
    return NextResponse.json({ error: `Organization is already ${nextStatus}.` }, { status: 409 });
  }

  const { error } = await supabase
    .from("organizations")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // actor_id stays null: admin access is a shared passcode, so there is no
  // profile row to attribute the decision to. See src/lib/admin-access.ts.
  await supabase.from("moderation_logs").insert({
    actor_id: null,
    target_type: "organization",
    target_id: id,
    action: nextStatus,
    notes: `${previousStatus} → ${nextStatus}`,
  });

  return NextResponse.json({ ok: true, previousStatus, status: nextStatus });
}
