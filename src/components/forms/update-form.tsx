"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload } from "lucide-react";
import { updateSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

type FormValues = z.infer<typeof updateSchema>;

export function UpdateForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    const detailsWithImage = imageUrl ? `${values.details}\n\n[image-url]${imageUrl}` : values.details;

    const response = await fetch("/api/dashboard/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, details: detailsWithImage }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? t.forms.couldNotCreateUpdate);
      return;
    }

    reset();
    setImageUrl("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Input label={t.forms.title} {...register("title")} error={errors.title?.message} />
      <Textarea label={t.forms.details} rows={4} {...register("details")} error={errors.details?.message} />
      <div className="space-y-2">
        <label htmlFor="update-image" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#ddc9b7] bg-white px-3 py-2 text-sm font-semibold text-[#7d4d2a] hover:bg-[#fff3e6]">
          {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploadingImage ? t.forms.uploadingImage : t.forms.uploadImageLabel}
        </label>
        <input
          id="update-image"
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isUploadingImage}
          onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0];
            if (!file) return;

            setError(null);
            setIsUploadingImage(true);
            try {
              const formData = new FormData();
              formData.append("file", file);
              const res = await fetch("/api/uploads/update-image", {
                method: "POST",
                body: formData,
              });
              const raw = await res.text();
              const data = raw ? (JSON.parse(raw) as { imageUrl?: string; error?: string }) : {};
              if (!res.ok || !data.imageUrl) {
                setError(data.error ?? t.forms.couldNotUploadImage);
                return;
              }
              setImageUrl(data.imageUrl);
            } catch {
              setError(t.forms.couldNotUploadImage);
            } finally {
              setIsUploadingImage(false);
              input.value = "";
            }
          }}
        />
        {imageUrl ? (
          <div className="rounded-lg border border-slate-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Update preview" className="h-44 w-full rounded-md object-cover" />
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.forms.saving : t.forms.publishUpdate}
      </Button>
    </form>
  );
}
