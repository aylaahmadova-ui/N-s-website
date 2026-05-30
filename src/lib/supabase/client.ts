import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBaseUrl } from "@/lib/supabase/url";

export function createClient() {
  return createBrowserClient(
    getSupabaseBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
