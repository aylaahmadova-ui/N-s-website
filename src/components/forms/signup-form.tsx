"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/lib/validation";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type FormValues = z.infer<typeof signUpSchema>;

export function SignupForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { accountType: "supporter" },
  });

  const accountType = watch("accountType");

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const raw = await response.text();
    let data: { error?: string; redirectTo?: string } = {};
    try {
      data = raw ? (JSON.parse(raw) as { error?: string; redirectTo?: string }) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      setError(data.error ?? t.forms.signUpFailed);
      return;
    }

    setMessage(t.forms.accountCreated);
    router.push(data.redirectTo ?? "/profile");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label={t.forms.fullName} {...register("fullName")} error={errors.fullName?.message} />
      <Input label={t.forms.email} type="email" {...register("email")} error={errors.email?.message} />
      <Input label={t.forms.password} type="password" {...register("password")} error={errors.password?.message} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.forms.accountType}</label>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...register("accountType")}
        >
          <option value="supporter">{t.forms.supporter}</option>
          <option value="organization">{t.forms.organization}</option>
        </select>
      </div>

      {accountType === "organization" ? (
        <>
          <Input
            label={t.forms.organizationName}
            {...register("organizationName")}
            error={errors.organizationName?.message}
          />
          <Textarea
            label={t.forms.organizationMission}
            rows={4}
            {...register("organizationMission")}
            error={errors.organizationMission?.message}
          />
        </>
      ) : null}

      {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.forms.creating : t.forms.createAccount}
      </Button>
    </form>
  );
}
