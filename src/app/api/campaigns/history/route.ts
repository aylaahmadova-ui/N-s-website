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

  // Public sees only approved; admin sees all
  let query = admin
    .from("campaign_donations")
    .select("id, donor_name, is_anonymous, amount, receipt_path, status, created_at, donor_registry(donor_surname)")
    .eq("campaign_id", parsed.data.campaignId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!adminUnlocked) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data ?? []).map(async (item: any) => {
      const registry = Array.isArray(item.donor_registry) ? item.donor_registry[0] : item.donor_registry;
      const donorSurname = registry?.donor_surname?.trim() ?? "";
      const fullName = [item.donor_name?.trim(), donorSurname].filter(Boolean).join(" ").trim();
      let receiptUrl: string | null = null;
      if (adminUnlocked && item.receipt_path) {
        const { data: signedData } = await admin.storage
          .from(DONATION_RECEIPTS_BUCKET)
          .createSignedUrl(item.receipt_path, 60 * 60);
        receiptUrl = signedData?.signedUrl ?? null;
      }

      return {
        id: item.id,
        donorName: item.is_anonymous ? "Anonymous" : fullName || item.donor_name,
        amount: Number(item.amount ?? 0),
        createdAt: item.created_at,
        status: item.status,
        receiptUrl,
      };
    }),
  );

  return NextResponse.json({ items: mapped });
}
