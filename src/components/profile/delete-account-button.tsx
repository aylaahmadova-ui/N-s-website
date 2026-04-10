"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmed = window.confirm(
      "Delete this account and all linked data? This cannot be undone.",
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const response = await fetch("/api/profile/delete-account", { method: "POST" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not delete account.");
      setLoading(false);
      return;
    }

    router.push(data.redirectTo ?? "/auth/signup");
    router.refresh();
  };

  return (
    <div className="mt-4">
      <button
        onClick={onDelete}
        disabled={loading}
        className="rounded-full border border-rose-300 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {loading ? "Deleting..." : "Delete This Account"}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
