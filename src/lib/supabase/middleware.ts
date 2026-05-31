import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseBaseUrl } from "@/lib/supabase/url";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseBaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  let user: { id: string } | null = null;

  const clearAuthCookies = () => {
    const authCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));

    authCookies.forEach((cookie) => {
      request.cookies.delete(cookie.name);
      supabaseResponse.cookies.delete(cookie.name);
    });
  };

  try {
    const { data, error } = await supabase.auth.getUser();
    user = data.user;

    if (error && error.message.toLowerCase().includes("refresh token")) {
      clearAuthCookies();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("refresh token")) {
      clearAuthCookies();
    } else {
      throw error;
    }
  }

  const pathname = request.nextUrl.pathname;

  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/apply"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
