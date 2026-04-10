import { getCurrentUser } from "@/lib/auth";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export async function SiteHeader() {
  const current = await getCurrentUser();

  return (
    <SiteHeaderClient
      user={
        current
          ? {
              fullName: current.profile?.full_name ?? null,
              role: current.profile?.role ?? null,
            }
          : null
      }
    />
  );
}
