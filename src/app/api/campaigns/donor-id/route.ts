import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.discriminatedUnion("donorType", [
  z.object({
    donorType: z.literal("new"),
    donorName: z.string().min(2),
    donorSurname: z.string().min(2),
    donorDescription: z.string().min(4),
    donorEmail: z.string().email(),
  }),
  z.object({
    donorType: z.literal("existing"),
    donorEmail: z.string().email(),
  }),
]);

function generateDonorId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "DN-";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid donor details." }, { status: 400 });
  }

  const admin = createAdminClient();
  const donorEmail = parsed.data.donorEmail.trim().toLowerCase();

  if (parsed.data.donorType === "existing") {
    const { data: existingByEmail, error: lookupError } = await admin
      .from("donor_registry")
      .select("donor_id, donor_name, donor_surname")
      .ilike("donor_email", donorEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 400 });
    }

    if (!existingByEmail?.donor_id) {
      return NextResponse.json({ error: "No donor found for this email." }, { status: 404 });
    }

    const fullName = `${existingByEmail.donor_name ?? ""} ${existingByEmail.donor_surname ?? ""}`.trim();
    return NextResponse.json({ ok: true, donorId: existingByEmail.donor_id, donorName: fullName || "Donor" });
  }

  const { donorName, donorSurname, donorDescription } = parsed.data;

  // Reuse existing donor profile if it already exists (case-insensitive) to avoid duplicates.
  const { data: existing } = await admin
    .from("donor_registry")
    .select("donor_id")
    .ilike("donor_email", donorEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.donor_id) {
    return NextResponse.json({ ok: true, donorId: existing.donor_id, donorName: `${donorName} ${donorSurname}`.trim() });
  }
  let donorId = "";

  for (let i = 0; i < 5; i++) {
    const candidate = generateDonorId();
    const { data: exists } = await admin.from("donor_registry").select("donor_id").eq("donor_id", candidate).maybeSingle();
    if (!exists) {
      donorId = candidate;
      break;
    }
  }

  if (!donorId) return NextResponse.json({ error: "Could not allocate donor ID." }, { status: 500 });

  const { error } = await admin.from("donor_registry").insert({
    donor_id: donorId,
    donor_name: donorName,
    donor_surname: donorSurname,
    donor_description: donorDescription,
    donor_email: donorEmail,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, donorId, donorName: `${donorName} ${donorSurname}`.trim() });
}
