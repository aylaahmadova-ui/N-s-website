import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { OrganizationReviewActions } from "@/components/admin/organization-review-actions";
import { ModerationActions } from "@/components/admin/moderation-actions";

type ModerationItem = {
  table: "products" | "campaigns" | "projects" | "updates";
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "published" | "draft";
};

export default async function AdminPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const [organizationsRes, productsRes, campaignsRes, projectsRes, updatesRes] = await Promise.all([
    supabase.from("organizations").select("id, display_name, description, status").order("created_at", { ascending: false }),
    supabase.from("products").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
    supabase.from("updates").select("id, title, status").eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  const moderationQueue: ModerationItem[] = [
    ...((productsRes.data ?? []).map((item) => ({ ...item, table: "products" as const }))),
    ...((campaignsRes.data ?? []).map((item) => ({ ...item, table: "campaigns" as const }))),
    ...((projectsRes.data ?? []).map((item) => ({ ...item, table: "projects" as const }))),
    ...((updatesRes.data ?? []).map((item) => ({ ...item, table: "updates" as const }))),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Approve organizations and moderate public content.</p>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Organization approvals" description="Review pending applications before publication rights are granted.">
          <div className="space-y-3">
            {organizationsRes.data?.map((org) => (
              <article key={org.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{org.display_name}</h3>
                  <StatusPill status={org.status} />
                </div>
                <p className="mt-1 text-sm text-slate-700">{org.description}</p>
                {org.status === "pending" ? (
                  <div className="mt-3">
                    <OrganizationReviewActions organizationId={org.id} />
                  </div>
                ) : null}
              </article>
            ))}
            {!organizationsRes.data?.length ? <p className="text-sm text-slate-600">No organizations found.</p> : null}
          </div>
        </Card>

        <Card title="Moderation queue" description="Content waiting for publish review.">
          <div className="space-y-3">
            {moderationQueue.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.table.slice(0, -1)}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
                <div className="mt-3">
                  <ModerationActions table={item.table} itemId={item.id} />
                </div>
              </article>
            ))}
            {!moderationQueue.length ? <p className="text-sm text-slate-600">No pending content in queue.</p> : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
