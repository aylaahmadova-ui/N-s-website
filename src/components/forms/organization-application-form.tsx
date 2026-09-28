"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { organizationApplicationSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type FormValues = z.infer<typeof organizationApplicationSchema>;

export function OrganizationApplicationForm() {
  const { t } = useLanguage();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(organizationApplicationSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/organizations/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? t.forms.couldNotSubmitApplication);
      return;
    }

    setMessage(t.forms.applicationSubmitted);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label={t.forms.legalName} {...register("legalName")} error={errors.legalName?.message} />
      <Input label={t.forms.displayName} {...register("displayName")} error={errors.displayName?.message} />
      <Textarea
        label={t.forms.orgDescription}
        rows={5}
        {...register("description")}
        error={errors.description?.message}
      />
      <Input label={t.forms.website} placeholder="https://..." {...register("website")} error={errors.website?.message} />
      <Input label={t.forms.contactEmail} type="email" {...register("contactEmail")} error={errors.contactEmail?.message} />

      {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.forms.submitting : t.forms.submitApplication}
      </Button>
    </form>
  );
}
