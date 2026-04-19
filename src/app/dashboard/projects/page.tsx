import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { ContentForm } from "@/components/forms/content-form";

export default async function ProjectsDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, summary, amount_needed, amount_raised, status")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card title="Create idea funding post" description="Idea funding posts are reviewed before they go public.">
            <ContentForm endpoint="/api/dashboard/projects" includeAmount actionLabel="Submit idea funding" />
          </Card>
          <Card title="Your idea funding posts">
            <div className="space-y-3">
              {projects?.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    <StatusPill status={project.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{project.summary}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Raised ${Number(project.amount_raised ?? 0).toFixed(2)} / $
                    {Number(project.amount_needed ?? 0).toFixed(2)}
                  </p>
                </article>
              ))}
              {!projects?.length ? <p className="text-sm text-slate-600">No idea funding posts yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
