"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

export function DeleteAccountButton() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmed = window.confirm(
      t.profile.deleteAccountConfirm,
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const response = await fetch("/api/profile/delete-account", { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? t.profile.deleteError);
      setLoading(false);
      return;
    }

    router.push(data.redirectTo ?? "/auth/signup");
    router.refresh();
  };

  return (
    <div>
      <button
        onClick={onDelete}
        disabled={loading}
        className="rounded-full border border-rose-300 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {loading ? t.profile.deleting : t.profile.deleteAccount}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
