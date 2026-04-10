import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { UpdateForm } from "@/components/forms/update-form";

export default async function UpdatesDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: updates } = await supabase
    .from("updates")
    .select("id, title, details, status, created_at")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title="Post progress update" description="Share milestones after receiving support.">
            <UpdateForm />
          </Card>
          <Card title="Your updates">
            <div className="space-y-3">
              {updates?.map((update) => (
                <article key={update.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{update.title}</h3>
                    <StatusPill status={update.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{update.details}</p>
                </article>
              ))}
              {!updates?.length ? <p className="text-sm text-slate-600">No updates posted yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
