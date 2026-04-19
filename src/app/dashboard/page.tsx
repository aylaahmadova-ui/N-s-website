import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { StatusPill } from "@/components/ui/status-pill";

export default async function DashboardPage() {
  const { user, profile } = await requireRole(["organization", "admin"]);
  const supabase = await createClient();

  const organization = await getOrganizationContext(user.id);
  const isAdmin = profile?.role === "admin";

  const [{ count: productCount }, { count: campaignCount }, { count: projectCount }, { count: updateCount }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization?.id ?? "00000000-0000-0000-0000-000000000000"),
      supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization?.id ?? "00000000-0000-0000-0000-000000000000"),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization?.id ?? "00000000-0000-0000-0000-000000000000"),
      supabase
        .from("updates")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization?.id ?? "00000000-0000-0000-0000-000000000000"),
    ]);

  if (!organization && !isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Card
          title="Complete your organization onboarding"
          description="You need an organization profile before posting child profiles or support opportunities."
        >
          <Link href="/apply" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
            Start application
          </Link>
        </Card>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Card title="Admin account" description="You have full moderation and approval access.">
          <Link href="/admin" className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
            Open admin dashboard
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title={organization?.display_name} description={organization?.description}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Organization status:</span>
              <StatusPill status={organization?.status ?? "pending"} />
            </div>
            {organization?.status !== "approved" ? (
              <p className="mt-3 text-sm text-amber-700">
                Your organization must be approved by admin before content can be published.
              </p>
            ) : null}
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            <Card title="Products" description={(productCount ?? 0) + " entries"} />
            <Card title="Donation Calls" description={(campaignCount ?? 0) + " entries"} />
            <Card title="Idea Funding" description={(projectCount ?? 0) + " entries"} />
            <Card title="Updates" description={(updateCount ?? 0) + " entries"} />
          </section>
        </div>
      </div>
    </div>
  );
}
