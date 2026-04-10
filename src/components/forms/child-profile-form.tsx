"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { childProfileSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof childProfileSchema>;

export function ChildProfileForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(childProfileSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const response = await fetch("/api/dashboard/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not create child profile.");
      return;
    }

    reset();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input label="Alias name" {...register("alias_name")} error={errors.alias_name?.message} />
      <Input label="Age range" placeholder="10-12" {...register("age_range")} error={errors.age_range?.message} />
      <Input label="Talents" {...register("talents")} error={errors.talents?.message} />
      <Textarea
        label="Story summary"
        rows={4}
        {...register("story_summary")}
        error={errors.story_summary?.message}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Add child profile"}
      </Button>
    </form>
  );
}
