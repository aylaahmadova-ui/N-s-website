"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contentSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = z.input<typeof contentSchema>;

export function ContentForm({
  endpoint,
  includePrice,
  includeAmount,
  actionLabel,
}: {
  endpoint: string;
  includePrice?: boolean;
  includeAmount?: boolean;
  actionLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not submit.");
      return;
    }

    reset();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input label="Title" {...register("title")} error={errors.title?.message} />
      <Textarea label="Summary" rows={4} {...register("summary")} error={errors.summary?.message} />
      {includePrice ? (
        <Input
          label="Price"
          type="number"
          step="0.01"
          {...register("price")}
          error={errors.price?.message}
        />
      ) : null}
      {includeAmount ? (
        <Input
          label="Amount needed"
          type="number"
          step="0.01"
          {...register("amount_needed")}
          error={errors.amount_needed?.message}
        />
      ) : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : actionLabel}
      </Button>
    </form>
  );
}
