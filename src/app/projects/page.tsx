import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { ProjectQuickForm } from "@/components/forms/project-quick-form";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, summary, amount_needed, amount_raised, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const isOrg = currentUser?.profile?.role === "organization";
  const isAdmin = currentUser?.profile?.role === "admin";
  const organizationUserId = currentUser?.user.id ?? null;
  const organization = (isOrg || isAdmin) && organizationUserId ? await getOrganizationContext(organizationUserId) : null;
  const postingEnabled = Boolean(organization) && (isOrg || isAdmin);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Project Funding</h1>
      <p className="mt-2 text-slate-600">Idea funding posts that unlock longer-term opportunities.</p>

      {postingEnabled ? (
        <section className="mt-6 mb-8">
          <Card
            className="rounded-3xl border-[#e3d5c7] bg-white/95 p-6"
            title="Post an idea funding request"
            description="Publish your funding idea from here. Admin review is required before it goes live."
          >
            <ProjectQuickForm />
          </Card>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects?.map((project) => (
          <Card key={project.id} title={project.title} description={project.summary}>
            <p className="text-sm text-slate-600">
              By{" "}
              {(Array.isArray(project.organizations)
                ? project.organizations[0]?.display_name
                : (project.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Raised ${Number(project.amount_raised ?? 0).toFixed(2)} / ${Number(project.amount_needed ?? 0).toFixed(2)}
            </p>
            <button className="mt-3 rounded-md bg-amber-700 px-3 py-2 text-sm text-white">Fund Project (placeholder)</button>
          </Card>
        ))}
        {!projects?.length ? <p className="text-slate-600">No published projects yet.</p> : null}
      </div>
    </div>
  );
}
