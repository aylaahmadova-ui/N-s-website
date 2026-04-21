import Link from "next/link";
import { HandCoins, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/dashboard";
import { Card } from "@/components/ui/card";
import { CampaignQuickForm } from "@/components/forms/campaign-quick-form";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  const { data: campaigns } = await supabase
    .from("campaigns")
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
      <section className="mb-8 rounded-3xl border border-[#e3d5c7] bg-gradient-to-br from-[#fff8f1] via-[#fff4e9] to-[#fef9f5] p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e6d5c3] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a5832]">
              <Sparkles className="h-3.5 w-3.5" />
              Destekly Donation Calls
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-amber-900 md:text-4xl">Donation Calls</h1>
            <p className="mt-2 max-w-2xl text-base text-[#6d5b4b] md:text-lg">
              Verified donation calls for immediate and real needs. If you are a verified organization, you can post calls here.
            </p>
          </div>
          <HandCoins className="mt-1 hidden h-8 w-8 text-[#b97843] md:block" />
        </div>
      </section>

      {postingEnabled ? (
        <section className="mb-8">
          <CampaignQuickForm />
        </section>
      ) : null}

      {!postingEnabled && currentUser ? (
        <div className="mb-8 rounded-2xl border border-[#e3d5c7] bg-[#fff8f0] p-4 text-sm text-[#705a49]">
          You are signed in as <span className="font-semibold">{currentUser.profile?.role ?? "supporter"}</span>. Only organization accounts can post donation calls.
        </div>
      ) : null}

      {(isOrg || isAdmin) && !organization ? (
        <div className="mb-8 rounded-2xl border border-[#e3d5c7] bg-[#fff8f0] p-4 text-sm text-[#705a49]">
          Your organization membership is not linked yet. Complete verification first from{" "}
          <Link href="/apply" className="font-semibold text-[#8b4e22] underline">
            Organization verification
          </Link>
          .
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-3">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id} className="flex h-[33rem] w-[18rem] flex-col overflow-hidden rounded-2xl border-[#eadccf] p-0">
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-[#f8e8d8] via-[#f7e9db] to-[#efe0d1]">
              <div className="rounded-full bg-white/80 p-5">
                <HandCoins className="h-10 w-10 text-[#b97843]" />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-3 pb-2">
              <h2 className="min-h-[3.2rem] text-base font-semibold leading-tight text-[#61341c]">{campaign.title}</h2>
              <p className="mt-0.5 min-h-[1.5rem] text-sm text-[#786455]">
                By{" "}
                {(Array.isArray(campaign.organizations)
                  ? campaign.organizations[0]?.display_name
                  : (campaign.organizations as { display_name?: string } | null)?.display_name) ?? "Organization"}
              </p>
              <p className="mt-0.5 min-h-[2.5rem] text-xs text-[#7f6b5b]">Open details to read the full donation call description.</p>
              <p className="pt-2 text-xs font-medium text-[#7a6552]">
                Raised ${Number(campaign.amount_raised ?? 0).toFixed(2)} / ${Number(campaign.amount_needed ?? 0).toFixed(2)}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <p className="text-base font-semibold text-[#8b4e22]">${Number(campaign.amount_needed ?? 0).toFixed(2)}</p>
                <button className="rounded-lg bg-[#a95d2b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#954e21]">
                  Donate
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!campaigns?.length ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#decab7] bg-[#fffaf6] px-4 py-10 text-center text-[#7b6857]">
          No active donation calls yet.
        </div>
      ) : null}
    </div>
  );
}
