import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseBaseUrl } from "@/lib/supabase/url";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore cookie set attempts from read-only contexts.
          }
        },
      },
    },
  );
}
