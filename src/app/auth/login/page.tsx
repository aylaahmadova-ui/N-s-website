"use client";

import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";

export default function LoginPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card title={t.auth.loginTitle} description={t.auth.loginDesc}>
        <LoginForm />
        <p className="mt-4 text-sm text-slate-600">
          {t.auth.noAccount}{" "}
          <Link href="/auth/signup" className="text-amber-700">{t.auth.createOne}</Link>
        </p>
      </Card>
    </div>
  );
}
