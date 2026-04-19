"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, ImagePlus, Loader2, PackagePlus, Plus, X } from "lucide-react";
import { contentSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type FormValues = z.input<typeof contentSchema>;

export function ProductQuickForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      summary: "",
      price: 0,
      image_url: "",
    },
  });

  const imageField = register("image_url");

  const onImageFileSelected = async (file: File | null) => {
    if (!file) return;

    setError(null);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not upload image.");
        return;
      }

      const imageUrl = data.imageUrl as string;
      setValue("image_url", imageUrl, { shouldDirty: true, shouldValidate: true });
      setPreviewUrl(imageUrl);
    } catch {
      setError("Could not upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);

    const response = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not submit product.");
      return;
    }

    reset({ title: "", summary: "", price: 0, image_url: "" });
    setPreviewUrl("");
    router.refresh();
  };

  if (!isOpen) {
    return (
      <div>
        <Button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm shadow-sm">
          <Plus className="h-4 w-4" />
          Post a product
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-[#eadccf] bg-[#fffdfb] p-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex items-center gap-1 rounded-md border border-[#e4d2c1] px-3 py-1 text-xs font-semibold text-[#7a4b2a] transition hover:bg-[#fff7ef]"
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Product title" placeholder="Hand-painted tote bag" {...register("title")} error={errors.title?.message} />
        <Textarea
          label="Description"
          rows={4}
          placeholder="What it is made from, why it is special, and who created it."
          {...register("summary")}
          error={errors.summary?.message}
          className="md:col-span-2"
        />
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          min={0}
          placeholder="25"
          {...register("price")}
          error={errors.price?.message}
        />
        <Input
          label="Image URL (optional)"
          type="url"
          placeholder="https://..."
          {...imageField}
          onChange={(event) => {
            imageField.onChange(event);
            setPreviewUrl(event.target.value);
          }}
          error={errors.image_url?.message}
        />
        <div className="rounded-xl border border-[#ddc9b7] bg-[#fffaf6] p-3 md:col-span-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a4b2a]">Upload image</p>
          <label
            htmlFor="product-image-file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#e4d2c1] bg-white px-3 py-2 text-sm font-medium text-[#7a4b2a] transition hover:bg-[#fff7ef]"
          >
            {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {isUploadingImage ? "Uploading..." : "Choose image from device"}
          </label>
          <input
            id="product-image-file"
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={isUploadingImage}
            onChange={(event) => onImageFileSelected(event.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-xs text-[#7b6857]">Max size 5MB. PNG, JPG, WEBP, GIF.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/60">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Product preview" className="h-36 w-full object-cover" />
        ) : (
          <div className="flex h-36 items-center justify-center gap-2 text-sm text-amber-800">
            <Camera className="h-4 w-4" />
            Product image preview appears here
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Button type="submit" className="w-full rounded-xl py-2.5 text-base shadow-sm">
        {isSubmitting ? "Submitting..." : (
          <span className="inline-flex items-center gap-2">
            <PackagePlus className="h-4 w-4" />
            Submit product for review
          </span>
        )}
      </Button>
    </form>
  );
}
