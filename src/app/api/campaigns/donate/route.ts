import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  campaignId: z.string().uuid(),
  donorName: z.string().min(2).optional(),
  donorId: z.string().min(6),
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
  const { campaignId, donorName, donorId, isAnonymous, receiptPath, amount } = parsed.data;

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("id, amount_needed, amount_raised, status")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Donation call not found." }, { status: 404 });
  }

  if (Number(campaign.amount_raised ?? 0) >= Number(campaign.amount_needed ?? 0)) {
    return NextResponse.json({ error: "This donation call is already fully funded. Thank you!" }, { status: 400 });
  }

  const resolvedDonorId = donorId;
  let resolvedDonorName = donorName ?? "";
  const { data: donor, error: donorError } = await admin
    .from("donor_registry")
    .select("donor_id, donor_name")
    .eq("donor_id", donorId)
    .maybeSingle();
  if (donorError || !donor) return NextResponse.json({ error: "Donor profile not found." }, { status: 404 });
  resolvedDonorName = donor.donor_name;

  const { error: logError } = await admin.from("campaign_donations").insert({
    campaign_id: campaignId,
    donor_id: resolvedDonorId,
    donor_name: resolvedDonorName,
    is_anonymous: isAnonymous,
    receipt_path: receiptPath,
    amount,
  });
  if (logError) return NextResponse.json({ error: logError.message }, { status: 400 });

  const currentRaised = Number(campaign.amount_raised ?? 0);
  const needed = Number(campaign.amount_needed ?? 0);
  const nextRaised = Math.min(currentRaised + amount, needed);
  const fullyFunded = nextRaised >= needed;

  const { error: updateError } = await admin
    .from("campaigns")
    .update({
      amount_raised: nextRaised,
      status: campaign.status,
    })
    .eq("id", campaignId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  return NextResponse.json({
    ok: true,
    donorId: null,
    thankYou: fullyFunded
      ? "Thank you. This donation call is now fully funded. Progress updates and photos will be shared in the Updates section."
      : "Thank you for your donation. Progress updates and photos for this call will be shared in the Updates section.",
  });
}
