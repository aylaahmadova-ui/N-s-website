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

type FormValues = z.infer<typeof signUpSchema>;

export function SignupForm() {
  const router = useRouter();
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

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Sign up failed.");
      return;
    }

    setMessage("Account created successfully.");
    router.push(data.redirectTo ?? "/profile");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Account type</label>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...register("accountType")}
        >
          <option value="supporter">Supporter</option>
          <option value="organization">Organization</option>
        </select>
      </div>

      {accountType === "organization" ? (
        <>
          <Input
            label="Organization name"
            {...register("organizationName")}
            error={errors.organizationName?.message}
          />
          <Textarea
            label="Organization mission"
            rows={4}
            {...register("organizationMission")}
            error={errors.organizationMission?.message}
          />
        </>
      ) : null}

      {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
