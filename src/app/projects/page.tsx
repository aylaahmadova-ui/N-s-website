/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { Lightbulb, Sparkles } from "lucide-react";
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
      <section className="relative overflow-hidden mb-8 rounded-3xl glass-panel p-6 shadow-sm md:p-8">
        <div className="absolute inset-0 z-0">
          <Image
            src="/projects_background.png"
            alt="Project funding background illustration"
            fill
            className="object-cover opacity-[0.15]"
            priority
          />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf]/95 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#9c5f30]">
              <Sparkles className="h-3.5 w-3.5" />
              Idea Funding
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#5c3418] md:text-4xl">Project Funding</h1>
            <p className="mt-2 max-w-2xl text-base text-[#735847] md:text-lg">
              Idea funding posts that unlock longer-term opportunities.
            </p>
          </div>
          <Lightbulb className="mt-1 hidden h-8 w-8 text-[#b97843] md:block animate-pulse" />
        </div>
      </section>

      {postingEnabled ? (
        <section className="mb-8">
          <Card
            className="glass-panel"
            title="Post an idea funding request"
            description="Publish your funding idea from here. Admin review is required before it goes live."
          >
            <ProjectQuickForm />
          </Card>
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {projects?.map((project: any) => (
          <Card key={project.id} className="glass-panel glass-panel-hover flex flex-col justify-between" title={project.title} description={project.summary}>
            <div className="mt-auto pt-4 border-t border-[#e3d5c7]/40 space-y-2.5">
              <p className="text-xs text-[#775c49]">
                By{" "}
                <span className="font-semibold text-[#623a1f]">
                  {(Array.isArray(project.organizations)
                    ? project.organizations[0]?.display_name
                    : (project.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
                </span>
              </p>
              <p className="text-sm font-extrabold text-[#8b4e22]">
                Raised AZN {Number(project.amount_raised ?? 0).toFixed(2)} / AZN {Number(project.amount_needed ?? 0).toFixed(2)}
              </p>
              <button className="w-full rounded-xl bg-[#a56131] hover:bg-[#8e4f25] py-2 text-sm font-bold text-white transition shadow-sm">
                Fund Project
              </button>
            </div>
          </Card>
        ))}
        {!projects?.length ? <p className="text-[#735847]">No published projects yet.</p> : null}
      </div>
    </div>
  );
}
