"use client";

import { useRouter } from "next/navigation";
import { PackageOpen, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

type ProductCardProps = {
  id: string;
  title: string;
  summary: string;
  price: number;
  imageUrl: string | null;
  adminUnlocked: boolean;
};

export function ProductCard({ id, title, summary, price, imageUrl, adminUnlocked }: ProductCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="relative">
      <Card
        className="flex h-[23.5rem] w-[16.5rem] max-w-[16.5rem] min-w-[16.5rem] cursor-pointer flex-col overflow-hidden rounded-2xl border-[#eadccf] bg-white p-0 transition hover:-translate-y-0.5 hover:shadow-md"
        title={undefined}
        description={undefined}
      >
        <button
          type="button"
          className="flex h-full w-full flex-col text-left"
          onClick={() => router.push(`/marketplace/${id}`)}
        >
          <div className="m-3 aspect-square overflow-hidden rounded-xl bg-[#f4e8dc]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[#9b6f4b]">
                <PackageOpen className="h-7 w-7" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col px-4 pb-4">
            <h2 className="text-base font-semibold leading-tight text-[#61341c]">{title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-[#786455]">{summary}</p>
            <p className="mt-auto pt-3 text-base font-semibold text-[#8b4e22]">AZN {Number(price ?? 0).toFixed(2)}</p>
            <p className="text-xs text-[#8a7a6b]">Tap to read story</p>
          </div>
        </button>
      </Card>

      {adminUnlocked ? (
        <button
          type="button"
          disabled={deleting}
          onClick={async (event) => {
            event.stopPropagation();
            if (!confirm("Delete this product?")) return;
            setDeleting(true);
            const response = await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" });
            setDeleting(false);
            if (response.ok) {
              router.refresh();
              return;
            }
            const raw = await response.text();
            try {
              const parsed = JSON.parse(raw) as { error?: string };
              alert(parsed.error ?? "Could not delete product.");
            } catch {
              alert("Could not delete product.");
            }
          }}
          className="absolute right-3 top-3 rounded-md border border-rose-200 bg-white/95 px-2 py-1 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1">
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting..." : "Delete"}
          </span>
        </button>
      ) : null}
    </div>
  );
}
