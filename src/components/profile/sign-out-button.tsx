"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function SignOutButton() {
  const { t } = useLanguage();
  const router = useRouter();

  const onSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <Button type="button" variant="secondary" onClick={onSignOut}>
      {t.profile.signOut}
    </Button>
  );
}

