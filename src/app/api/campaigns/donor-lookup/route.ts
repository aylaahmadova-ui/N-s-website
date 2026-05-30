import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  donorId: z.string().min(6),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter your donor ID." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: donor, error } = await admin
    .from("donor_registry")
    .select("donor_id, donor_name, donor_surname, birth_year, donor_description")
    .eq("donor_id", parsed.data.donorId)
    .maybeSingle();

  if (error || !donor) {
    return NextResponse.json({ error: "Donor ID not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    donorName: donor.donor_name,
    donorSurname: donor.donor_surname,
    birthYear: donor.birth_year,
    donorDescription: donor.donor_description,
  });
}
