"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lightbulb, Plus, Rocket, X } from "lucide-react";
import { contentSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type FormValues = z.input<typeof contentSchema>;

export function ProjectQuickForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      summary: "",
      amount_needed: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const response = await fetch("/api/dashboard/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? t.forms.couldNotSubmitIdea);
      return;
    }

    reset({ title: "", summary: "", amount_needed: 0 });
    setIsOpen(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-dashed border-[#ddc9b7] bg-[#fffaf6] p-5">
        <p className="text-sm text-[#7b6857]">{t.forms.haveIdea}</p>
        <Button type="button" onClick={() => setIsOpen(true)} className="mt-3 inline-flex items-center gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          {t.forms.postIdea}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex items-center gap-1 rounded-md border border-[#e4d2c1] px-3 py-1 text-xs font-semibold text-[#7a4b2a] transition hover:bg-[#fff7ef]"
        >
          <X className="h-3.5 w-3.5" />
          {t.forms.close}
        </button>
      </div>

      <Input label={t.forms.ideaTitle} placeholder="Eco art workshop for children" {...register("title")} error={errors.title?.message} />

      <Textarea
        label={t.forms.description}
        rows={4}
        placeholder={t.forms.ideaDescription}
        {...register("summary")}
        error={errors.summary?.message}
      />

      <Input
        label={t.forms.fundingGoal}
        type="number"
        step="0.01"
        min={0}
        placeholder="500"
        {...register("amount_needed")}
        error={errors.amount_needed?.message}
      />

      <div className="rounded-xl border border-[#decab7] bg-[#fffaf6] p-3 text-sm text-[#7b6857]">
        <p className="inline-flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-[#8b4e22]" />
          {t.forms.reviewedBeforePublication}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" className="w-full rounded-xl py-2.5 text-base" disabled={isSubmitting}>
        {isSubmitting ? (
          t.forms.submitting
        ) : (
          <span className="inline-flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            {t.forms.submitIdea}
          </span>
        )}
      </Button>
    </form>
  );
}
