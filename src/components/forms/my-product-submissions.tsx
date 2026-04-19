"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/ui/status-pill";

type SubmissionStatus = "pending" | "approved" | "rejected" | "published" | "draft";

type Submission = {
  id: string;
  title: string;
  summary: string;
  price: number;
  image_url: string | null;
  status: SubmissionStatus;
};

export function MyProductSubmissions({ items }: { items: Submission[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingItem = useMemo(() => items.find((item) => item.id === editingId) ?? null, [items, editingId]);

  function startEditing(item: Submission) {
    setEditingId(item.id);
    setTitle(item.title);
    setSummary(item.summary);
    setPrice(String(item.price ?? 0));
    setImageUrl(item.image_url ?? "");
    setError(null);
  }

  function stopEditing() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/dashboard/products/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        summary,
        price: Number(price),
        image_url: imageUrl,
      }),
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Could not update post.");
      return;
    }

    stopEditing();
    router.refresh();
  }

  async function deletePost(itemId: string) {
    const confirmed = window.confirm("Delete this product post?");
    if (!confirmed) return;

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/dashboard/products/${itemId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Could not delete post.");
      return;
    }

    if (editingId === itemId) stopEditing();
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-xl border border-[#ead9c8] bg-[#fff9f4] p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[#62381f]">{item.title}</h3>
            <StatusPill status={item.status} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[#8b4e22]">${Number(item.price ?? 0).toFixed(2)}</p>

          <div className="mt-3 flex gap-2">
            <Button type="button" className="text-xs" onClick={() => startEditing(item)} disabled={isSubmitting}>
              Edit
            </Button>
            <Button type="button" variant="danger" className="text-xs" onClick={() => deletePost(item.id)} disabled={isSubmitting}>
              Delete
            </Button>
          </div>
        </article>
      ))}

      {!items.length ? (
        <p className="rounded-xl border border-dashed border-[#decab7] bg-[#fffaf6] px-3 py-4 text-sm text-[#7b6857]">
          No product submissions yet. Use the form to publish your first handmade item.
        </p>
      ) : null}

      {editingItem ? (
        <div className="rounded-xl border border-[#decab7] bg-white p-4">
          <h4 className="text-base font-semibold text-[#62381f]">Edit post</h4>
          <p className="mt-1 text-xs text-[#7b6857]">Saving changes moves the post back to pending review.</p>
          <div className="mt-3 space-y-3">
            <Input label="Product title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea label="Description" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} />
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <Input
              label="Image URL (optional)"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="button" onClick={saveEdit} disabled={isSubmitting}>
                Save changes
              </Button>
              <Button type="button" variant="secondary" onClick={stopEditing} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

