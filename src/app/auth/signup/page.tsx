"use client";

import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";

export default function SignupPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card title={t.auth.signupTitle} description={t.auth.signupDesc}>
        <SignupForm />
        <p className="mt-4 text-sm text-slate-600">
          {t.auth.alreadyRegistered}{" "}
          <Link href="/auth/login" className="text-amber-700">{t.auth.signInLink}</Link>
        </p>
      </Card>
    </div>
  );
}
