export function getSupabaseBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!raw) return raw;
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1$/i, "");
}
