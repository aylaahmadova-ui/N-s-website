import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";

export default async function ProfilePage() {
  const { user, profile } = await requireAuth();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, display_name, legal_name, status, contact_email, website)")
    .eq("user_id", user.id);

  const primaryOrganization = membership?.[0]?.organizations as
    | {
        id: string;
        display_name: string;
        legal_name: string;
        status: string;
        contact_email: string;
        website: string | null;
      }
    | undefined;
  const isOrganization = profile?.role === "organization";

  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold text-[#5c3418]">{isOrganization ? "Organization Profile" : "Your Profile"}</h1>

        <section className="rounded-2xl border border-[#e3d5c7] bg-[#fff9f2] p-6">
          <p className="text-sm uppercase tracking-[0.12em] text-[#9c5f30]">Account</p>
          <div className="mt-3 space-y-2 text-[#6f513d]">
            <p>
              <span className="font-semibold">Name:</span> {profile?.full_name ?? "Not set"}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {profile?.role ?? "Not set"}
            </p>
          </div>
          {profile?.role === "admin" ? (
            <div className="mt-4">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-full bg-[#a56131] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#8f4f25]"
              >
                Open Admin Dashboard
              </Link>
            </div>
          ) : null}
          <DeleteAccountButton />
        </section>

        {isOrganization ? (
          <section className="rounded-2xl border border-[#e3d5c7] bg-[#fff9f2] p-6">
            <p className="text-sm uppercase tracking-[0.12em] text-[#9c5f30]">Organization</p>
            {primaryOrganization ? (
              <div className="mt-3 space-y-2 text-[#6f513d]">
                <p>
                  <span className="font-semibold">Display Name:</span> {primaryOrganization.display_name}
                </p>
                <p>
                  <span className="font-semibold">Legal Name:</span> {primaryOrganization.legal_name}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {primaryOrganization.status}
                </p>
                <p>
                  <span className="font-semibold">Contact Email:</span> {primaryOrganization.contact_email}
                </p>
                <p>
                  <span className="font-semibold">Website:</span> {primaryOrganization.website ?? "Not set"}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-[#6f513d]">
                Organization details are not linked yet. Submit your organization application to create the profile.
              </p>
            )}
          </section>
        ) : null}

        <section className="rounded-2xl border border-[#e3d5c7] bg-white p-6">
          <p className="text-sm uppercase tracking-[0.12em] text-[#9c5f30]">Organization Membership</p>
          {membership?.length ? (
            <ul className="mt-3 space-y-2 text-[#6f513d]">
              {membership.map((item) => (
                <li key={item.organization_id}>
                  Org: {(item.organizations as { display_name?: string } | null)?.display_name ?? item.organization_id} (
                  {item.role})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[#6f513d]">No organization memberships linked yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
