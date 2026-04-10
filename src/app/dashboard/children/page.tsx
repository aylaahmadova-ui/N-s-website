import { requireRole } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Card } from "@/components/ui/card";
import { ChildProfileForm } from "@/components/forms/child-profile-form";

export default async function ChildrenDashboardPage() {
  const { user } = await requireRole(["organization"]);
  const organization = await getOrganizationContext(user.id);
  const supabase = await createClient();

  const { data: childProfiles } = await supabase
    .from("child_profiles")
    .select("id, alias_name, age_range, talents, story_summary")
    .eq("organization_id", organization?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <DashboardNav />
        <div className="space-y-5">
          <Card
            title="Add child profile"
            description="Use alias names only. Never include legal names, addresses, or direct identifiers."
          >
            <ChildProfileForm />
          </Card>
          <Card title="Child profiles" description="Anonymized profiles managed by your organization">
            <div className="space-y-3">
              {childProfiles?.map((child) => (
                <article key={child.id} className="rounded-lg border border-slate-200 p-3">
                  <h3 className="font-semibold text-slate-900">{child.alias_name}</h3>
                  <p className="text-sm text-slate-600">Age range: {child.age_range}</p>
                  <p className="text-sm text-slate-600">Talents: {child.talents}</p>
                  <p className="mt-2 text-sm text-slate-700">{child.story_summary}</p>
                </article>
              ))}
              {!childProfiles?.length ? <p className="text-sm text-slate-600">No child profiles yet.</p> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
