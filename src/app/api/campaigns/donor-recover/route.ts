import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  donorName: z.string().min(2),
  donorSurname: z.string().min(2),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter name and surname." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { donorName, donorSurname } = parsed.data;

  const { data, error } = await admin
    .from("donor_registry")
    .select("donor_id, donor_name, donor_surname, birth_year, donor_description")
    .ilike("donor_name", `%${donorName}%`)
    .ilike("donor_surname", `%${donorSurname}%`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Collapse duplicate profiles that represent the same person.
  const unique = new Map<string, (typeof data)[number]>();
  for (const item of data ?? []) {
    const surname = (item.donor_surname ?? "").trim().toLowerCase();
    let normalizedName = (item.donor_name ?? "").trim().toLowerCase();
    if (surname && normalizedName.endsWith(` ${surname}`)) {
      normalizedName = normalizedName.slice(0, -(surname.length + 1)).trim();
    }
    const key = `${normalizedName}|${surname}|${(item.donor_description ?? "").trim().toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, item);
  }

  return NextResponse.json({
    ok: true,
    matches: Array.from(unique.values()).map((item) => ({
      donorId: item.donor_id,
      donorName: item.donor_name,
      donorSurname: item.donor_surname,
      birthYear: item.birth_year,
      donorDescription: item.donor_description,
    })),
  });
}
