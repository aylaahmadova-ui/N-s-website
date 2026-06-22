import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  campaignId: z.string().uuid(),
  donorEmail: z.string().email(),
  isAnonymous: z.boolean(),
  receiptPath: z.string().min(3),
  amount: z.coerce.number().positive(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid donation payload." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { campaignId, donorEmail, isAnonymous, receiptPath, amount } = parsed.data;

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("id, amount_needed, amount_raised, is_done, status")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Donation call not found." }, { status: 404 });
  }

  if (campaign.is_done || Number(campaign.amount_raised ?? 0) >= Number(campaign.amount_needed ?? 0)) {
    return NextResponse.json({ error: "This donation call is already fully funded. Thank you!" }, { status: 400 });
  }

  // Look up donor by email server-side — never trust a client-supplied donorId
  const { data: donor, error: donorError } = await admin
    .from("donor_registry")
    .select("donor_id, donor_name")
    .ilike("donor_email", donorEmail.trim().toLowerCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (donorError || !donor) {
    return NextResponse.json({ error: "Donor profile not found." }, { status: 404 });
  }

  const donorId = donor.donor_id;

  // Insert donation with status = 'pending' — trigger will update amount_raised on approval
  const { error: logError } = await admin.from("campaign_donations").insert({
    campaign_id: campaignId,
    donor_id: donorId,
    donor_name: donor.donor_name,
    is_anonymous: isAnonymous,
    receipt_path: receiptPath,
    amount,
    status: "pending",
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    thankYou:
      "Thank you for your donation. Our team will review your receipt and confirm it shortly. Progress updates will be shared on the Updates board.",
  });
}
