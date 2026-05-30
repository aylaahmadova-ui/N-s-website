import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

const querySchema = z.object({
  campaignId: z.string().uuid(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    campaignId: searchParams.get("campaignId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid campaign ID." }, { status: 400 });
  }

  const admin = createAdminClient();
  const adminUnlocked = await isAdminUnlocked();

  const { data, error } = await admin
    .from("campaign_donations")
    .select("id, donor_name, is_anonymous, amount, receipt_path, created_at")
    .eq("campaign_id", parsed.data.campaignId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const mapped = await Promise.all(
    (data ?? []).map(async (item) => {
      let receiptUrl: string | null = null;
      if (adminUnlocked && item.receipt_path) {
        const { data: signedData } = await admin.storage
          .from(DONATION_RECEIPTS_BUCKET)
          .createSignedUrl(item.receipt_path, 60 * 60);
        receiptUrl = signedData?.signedUrl ?? null;
      }

      return {
        id: item.id,
        donorName: item.is_anonymous ? "Anonymous" : item.donor_name,
        amount: Number(item.amount ?? 0),
        createdAt: item.created_at,
        receiptUrl,
      };
    }),
  );

  return NextResponse.json({ items: mapped });
}
