import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, summary, amount_needed, amount_raised, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Project Funding</h1>
      <p className="mt-2 text-slate-600">Idea and project posts that unlock longer-term opportunities.</p>
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
