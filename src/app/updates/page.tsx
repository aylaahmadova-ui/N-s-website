import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function UpdatesPage() {
  const supabase = await createClient();
  const { data: updates } = await supabase
    .from("updates")
    .select("id, title, details, created_at, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-semibold text-amber-900">Impact Updates</h1>
      <p className="mt-2 text-slate-600">Moderated progress stories after support is received.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {updates?.map((update) => (
          <Card key={update.id} title={update.title} description={update.details}>
            <p className="text-sm text-slate-600">
              By{" "}
              {(Array.isArray(update.organizations)
                ? update.organizations[0]?.display_name
                : (update.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {update.created_at ? new Date(update.created_at).toLocaleDateString() : ""}
            </p>
          </Card>
        ))}
        {!updates?.length ? <p className="text-slate-600">No updates published yet.</p> : null}
      </div>
    </div>
  );
}
