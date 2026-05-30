"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminUnlockPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-8">
      <Card title="Admin Access" description="Enter your admin passcode to open the moderation dashboard.">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const res = await fetch("/api/admin/unlock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ passcode }),
            });
            const data = (await res.json()) as { error?: string };
            setLoading(false);
            if (!res.ok) {
              setError(data.error ?? "Invalid passcode.");
              return;
            }
            router.push("/admin");
            router.refresh();
          }}
        >
          <Input
            label="Passcode"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Unlock Admin"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
