"use client";

import { useLanguage } from "@/lib/i18n/context";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import Link from "next/link";
import { StatusPill } from "@/components/ui/status-pill";

interface DonationItem {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  is_anonymous: boolean;
  receipt_url: string | null;
  campaigns?: {
    title: string;
  } | null;
}

interface SupporterStats {
  totalDonated: number;
  donationCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

interface AdminStats {
  pendingCampaigns: number;
  pendingUpdates: number;
  pendingOrganizations: number;
  pendingDonations: number;
}

interface OrgDetails {
  id: string;
  display_name: string;
  legal_name: string;
  status: string;
  contact_email: string;
  website: string | null;
}

interface ProfileClientProps {
  user: {
    email: string;
  };
  profile: {
    full_name: string | null;
    role: string | null;
  } | null;
  donations?: DonationItem[];
  supporterStats?: SupporterStats;
  adminStats?: AdminStats;
  organization?: OrgDetails | null;
  memberships?: {
    organization_id: string;
    role: string;
    organizations: {
      display_name: string;
    } | null;
  }[];
}

export default function ProfileClient({
  user,
  profile,
  donations = [],
  supporterStats,
  adminStats,
  organization,
  memberships = [],
}: ProfileClientProps) {
  const { t, lang } = useLanguage();

  const isOrg = profile?.role === "organization";
  const isAdmin = profile?.role === "admin";
  const isSupporter = profile?.role === "supporter" || (!isOrg && !isAdmin);

  return (
    <div className="min-h-screen bg-[#f6f1ea] px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#e3d5c7] pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#5c3418] tracking-tight">
              {isOrg ? t.profile.orgTitle : isAdmin ? t.profile.adminTitle : t.profile.title}
            </h1>
            <p className="mt-1 text-sm text-[#7f5d44] opacity-90">
              {t.profile.name}: <span className="font-medium text-[#5c3418]">{profile?.full_name ?? t.profile.notSet}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#a56131] px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider">
              {profile?.role ?? "supporter"}
            </span>
            <span className="text-sm font-medium text-[#7f5d44] border border-[#e3d5c7] bg-white/50 px-3 py-1 rounded-full shadow-sm">
              {user.email}
            </span>
          </div>
        </div>

        {/* Admin Dashboard Statistics Section */}
        {isAdmin && adminStats && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#5c3418]">{t.profile.adminStatsTitle}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              <div className="group relative overflow-hidden rounded-2xl border border-[#e3d5c7] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
                <p className="text-xs uppercase tracking-wider text-[#9c5f30] font-semibold">{t.profile.pendingCampaigns}</p>
                <p className="mt-2 text-4xl font-extrabold text-[#5c3418]">{adminStats.pendingCampaigns}</p>
                <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#a56131] group-hover:scale-110 transition-transform">
                  📝
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-[#e3d5c7] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
                <p className="text-xs uppercase tracking-wider text-[#9c5f30] font-semibold">{t.profile.pendingUpdates}</p>
                <p className="mt-2 text-4xl font-extrabold text-[#5c3418]">{adminStats.pendingUpdates}</p>
                <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#a56131] group-hover:scale-110 transition-transform">
                  📣
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-[#e3d5c7] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
                <p className="text-xs uppercase tracking-wider text-[#9c5f30] font-semibold">{t.profile.pendingOrganizations}</p>
                <p className="mt-2 text-4xl font-extrabold text-[#5c3418]">{adminStats.pendingOrganizations}</p>
                <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#a56131] group-hover:scale-110 transition-transform">
                  🏢
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-[#e3d5c7] bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
                <p className="text-xs uppercase tracking-wider text-[#9c5f30] font-semibold">{t.profile.pendingDonationsAdmin}</p>
                <p className="mt-2 text-4xl font-extrabold text-[#5c3418]">{adminStats.pendingDonations}</p>
                <div className="absolute right-4 bottom-4 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#a56131] group-hover:scale-110 transition-transform">
                  💵
                </div>
              </div>

            </div>

            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center rounded-full bg-[#a56131] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow transition-all hover:bg-[#8f4f25] hover:-translate-y-0.5 duration-150"
              >
                {t.profile.adminDashboard} &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Supporter Statistics & Donation History Section */}
        {isSupporter && supporterStats && (
          <div className="space-y-8">
            
            {/* Stats Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#5c3418]">{t.profile.supporterSection}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Total Donated Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8c532b] to-[#b07850] p-6 text-white shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-[#fcfcfc] opacity-80 font-bold">{t.profile.totalDonated}</p>
                  <p className="mt-2 text-3xl font-black">{supporterStats.totalDonated.toFixed(2)} AZN</p>
                  <div className="absolute right-4 bottom-4 opacity-15 text-4xl">❤️</div>
                </div>

                <div className="rounded-2xl border border-[#e3d5c7] bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-[#9c5f30] font-bold">{t.profile.donationCount}</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#5c3418]">{supporterStats.donationCount}</p>
                </div>

                <div className="rounded-2xl border border-[#e3d5c7] bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-green-700 font-bold">{t.profile.approvedDonations}</p>
                  <p className="mt-2 text-3xl font-extrabold text-green-700">{supporterStats.approvedCount}</p>
                </div>

                <div className="rounded-2xl border border-[#e3d5c7] bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-amber-700 font-bold">{t.profile.pendingDonations}</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-700">{supporterStats.pendingCount}</p>
                </div>

              </div>
            </section>

            {/* Donation History Table */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#5c3418]">{t.profile.donationHistory}</h2>
              <div className="overflow-hidden rounded-2xl border border-[#e3d5c7] bg-white shadow-sm">
                
                {donations.length === 0 ? (
                  <div className="p-8 text-center text-[#7f5d44] opacity-80">
                    <p className="text-base font-medium">{t.profile.noDonationsYet}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#fff9f2] border-b border-[#e3d5c7] text-[#5c3418] font-bold text-sm">
                          <th className="px-6 py-4">{t.profile.dateCol}</th>
                          <th className="px-6 py-4">{t.profile.campaignCol}</th>
                          <th className="px-6 py-4 text-right">{t.profile.amountCol}</th>
                          <th className="px-6 py-4 text-center">{t.profile.statusCol}</th>
                          <th className="px-6 py-4 text-right">{t.profile.viewReceipt}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2e7dc] text-[#6f513d] text-sm">
                        {donations.map((donation) => (
                          <tr key={donation.id} className="hover:bg-[#fffcf9] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(donation.created_at).toLocaleDateString(lang === "en" ? "en-US" : lang === "az" ? "az-AZ" : "ru-RU", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4 font-medium max-w-[240px] truncate">
                              {donation.campaigns?.title ?? "General Fund"}
                              {donation.is_anonymous && (
                                <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  {t.profile.anonymousHint}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold whitespace-nowrap text-[#5c3418]">
                              {donation.amount.toFixed(2)} AZN
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span className="inline-flex">
                                <StatusPill status={donation.status} />
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              {donation.receipt_url ? (
                                <a
                                  href={donation.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs font-semibold text-[#a56131] hover:underline"
                                >
                                  📄 {t.profile.viewReceipt}
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 italic">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </section>

          </div>
        )}

        {/* Organization Profile Details Section */}
        {isOrg && (
          <div className="space-y-6">
            
            {/* Organization Main Details Card */}
            <section className="rounded-2xl border border-[#e3d5c7] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#f2e7dc] pb-3">
                <h2 className="text-xl font-bold text-[#5c3418]">{t.profile.orgSection}</h2>
                {organization && (
                  <span className="inline-flex">
                    <StatusPill status={organization.status as any} />
                  </span>
                )}
              </div>

              {organization ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#6f513d]">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#9c5f30] block font-semibold">
                      {t.profile.displayName}
                    </span>
                    <span className="text-base font-bold text-[#5c3418]">{organization.display_name}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#9c5f30] block font-semibold">
                      {t.profile.legalName}
                    </span>
                    <span className="text-base font-semibold">{organization.legal_name}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#9c5f30] block font-semibold">
                      {t.profile.contactEmail}
                    </span>
                    <span className="text-base font-medium">{organization.contact_email}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#9c5f30] block font-semibold">
                      {t.profile.website}
                    </span>
                    {organization.website ? (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-semibold text-[#a56131] hover:underline block"
                      >
                        {organization.website}
                      </a>
                    ) : (
                      <span className="text-base italic text-slate-400 block">{t.profile.notSet}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#7f5d44]">{t.profile.orgNotLinked}</p>
              )}

              {organization && (
                <div className="pt-4 border-t border-[#f2e7dc] flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center rounded-full bg-[#a56131] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:shadow hover:bg-[#8f4f25] transition-all hover:-translate-y-0.5"
                  >
                    {t.profile.orgDashboard} &rarr;
                  </Link>
                </div>
              )}
            </section>

            {/* Memberships Section */}
            <section className="rounded-2xl border border-[#e3d5c7] bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-[#5c3418]">{t.profile.membershipsSection}</h2>
              {memberships.length > 0 ? (
                <ul className="divide-y divide-[#f2e7dc] text-[#6f513d]">
                  {memberships.map((member) => (
                    <li key={member.organization_id} className="py-3 flex justify-between items-center text-sm">
                      <span className="font-semibold text-[#5c3418]">
                        {member.organizations?.display_name ?? member.organization_id}
                      </span>
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#7f5d44]">{t.profile.noMemberships}</p>
              )}
            </section>

          </div>
        )}

        {/* Global Settings & Danger Actions Card */}
        <section className="rounded-2xl border border-[#e3d5c7] bg-[#fff9f2] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#5c3418]">{t.profile.accountSection}</h3>
              <p className="text-xs text-[#7f5d44] opacity-80">
                Manage your credentials or delete your database profile permanently.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SignOutButton />
              <DeleteAccountButton />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
