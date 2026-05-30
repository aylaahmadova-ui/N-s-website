import { createClient } from "@supabase/supabase-js";
import { getSupabaseBaseUrl } from "@/lib/supabase/url";

export function createAdminClient() {
  return createClient(
    getSupabaseBaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
