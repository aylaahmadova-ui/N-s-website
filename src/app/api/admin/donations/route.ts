import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

const schema = z.object({
  donationId: z.string().uuid(),
  action: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;

  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { donationId, action, notes } = parsed.data;

  // Fetch the donation first so we can clean up storage on rejection
  const { data: donation, error: fetchError } = await admin
    .from("campaign_donations")
    .select("id, status, receipt_path, campaign_id")
    .eq("id", donationId)
    .maybeSingle();

  if (fetchError || !donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  if (donation.status !== "pending") {
    return NextResponse.json({ error: "Donation has already been reviewed." }, { status: 400 });
  }

  // Update status — the DB trigger fires here if action === 'approved'
  const { error: updateError } = await admin
    .from("campaign_donations")
    .update({ status: action })
    .eq("id", donationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // On rejection: delete receipt from storage to free space
  if (action === "rejected" && donation.receipt_path) {
    await admin.storage.from(DONATION_RECEIPTS_BUCKET).remove([donation.receipt_path]);
  }

  await admin.from("moderation_logs").insert({
    actor_id: null,
    target_type: "donation",
    target_id: donationId,
    action,
    notes: notes ?? `Admin ${action} donation`,
  });

  // Bust caches affected by donation status changes
  revalidateTag("recognition-ranked-donors", "max");
  revalidateTag("campaigns-published", "max");
  revalidateTag("campaigns-clothes-published", "max");

  return NextResponse.json({ ok: true, action });
}
