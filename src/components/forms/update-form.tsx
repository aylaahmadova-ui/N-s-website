"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof updateSchema>;

export function UpdateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(updateSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const response = await fetch("/api/dashboard/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not create update.");
      return;
    }

    reset();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input label="Title" {...register("title")} error={errors.title?.message} />
      <Textarea label="Details" rows={4} {...register("details")} error={errors.details?.message} />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Publish update request"}
      </Button>
    </form>
  );
}
