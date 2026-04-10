import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiContext, hasRole } from "@/lib/api";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["admin"])) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
  }

  const { id } = await params;

  const { error } = await context.supabase.from("organizations").update({ status: parsed.data.status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await context.supabase.from("moderation_logs").insert({
    actor_id: context.user.id,
    target_type: "organization",
    target_id: id,
    action: parsed.data.status,
    notes: "Organization review decision",
  });

  return NextResponse.json({ ok: true });
}
