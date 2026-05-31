"use client";

import { useState } from "react";
import { HandCoins, History, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string;
  receiptUrl: string | null;
};

type CampaignCardProps = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  cardNumber?: string | null;
  contactNumber?: string | null;
  amountNeeded: number;
  amountRaised: number;
  adminUnlocked: boolean;
  clothesOnly?: boolean;
  isDone?: boolean;
};

export function CampaignCard({ id, title, summary, imageUrl, cardNumber, contactNumber, amountNeeded, amountRaised, adminUnlocked, clothesOnly = false, isDone = false }: CampaignCardProps) {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [donorType, setDonorType] = useState<"new" | "existing">("new");
  const [donorName, setDonorName] = useState("");
  const [donorSurname, setDonorSurname] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorDescription, setDonorDescription] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState("");
  const [selectedDonorName, setSelectedDonorName] = useState("");
  const [selectedDonorDescription, setSelectedDonorDescription] = useState("");

  const [visibility, setVisibility] = useState<"anonymous" | "name">("anonymous");
  const [amount, setAmount] = useState("");
  const [receiptPath, setReceiptPath] = useState("");
  const [receiptLabel, setReceiptLabel] = useState("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fullyFunded = amountRaised >= amountNeeded;
  const visuallyDone = clothesOnly ? isDone : fullyFunded;
  const identityReady = clothesOnly ? true : !!selectedDonorId;
  const canDonate = identityReady && Number(amount) > 0 && !!receiptPath && !loading;

  function resetDonateFlow() {
    setStep(1);
    setDonorType("new");
    setDonorName("");
    setDonorSurname("");
    setDonorEmail("");
    setDonorDescription("");
    setSelectedDonorId("");
    setSelectedDonorName("");
    setSelectedDonorDescription("");
    setVisibility("anonymous");
    setAmount("");
    setReceiptPath("");
    setReceiptLabel("");
    setError(null);
  }

  async function openHistory() {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`/api/campaigns/history?campaignId=${id}`);
      const raw = await res.text();
      const data = raw ? (JSON.parse(raw) as { items?: HistoryItem[]; error?: string }) : {};
      if (!res.ok) {
        setHistoryError(data.error ?? "Could not load donation history.");
        setHistoryItems([]);
      } else {
        setHistoryItems(data.items ?? []);
      }
    } catch {
      setHistoryError("Could not load donation history.");
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <div className="relative w-full md:w-auto">
      <Card
        className={`flex h-[23.5rem] w-full min-w-0 max-w-none flex-col overflow-hidden rounded-2xl border-[#eadccf] bg-white p-0 transition hover:-translate-y-0.5 hover:shadow-md md:w-[16.5rem] md:max-w-[16.5rem] md:min-w-[16.5rem] ${visuallyDone ? "grayscale-[0.35] opacity-75" : ""}`}
      >
        <div className={`m-3 overflow-hidden rounded-xl bg-[#f4e8dc] ${clothesOnly ? "aspect-square" : "h-36"}`}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f8e8d8] via-[#f7e9db] to-[#efe0d1]">
              <div className="rounded-full bg-white/80 p-5">
                <HandCoins className="h-10 w-10 text-[#b97843]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 pb-4">
          <h2 className="text-base font-semibold leading-tight text-[#61341c]">{title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-[#786455]">{summary}</p>
          {!clothesOnly ? <p className="pt-1 text-sm font-bold text-[#8b4e22]">Raised AZN {Number(amountRaised ?? 0).toFixed(2)} / AZN {Number(amountNeeded ?? 0).toFixed(2)}</p> : null}

          <div className="mt-auto flex items-center gap-2 pt-2">
            {!clothesOnly ? (
              <button type="button" onClick={openHistory} className="rounded-lg border border-[#d7bca5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7d4d2a] transition hover:bg-[#fff5eb]">
                <span className="inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  History
                </span>
              </button>
            ) : null}
            <button
              type="button"
              disabled={visuallyDone}
              onClick={() => {
                resetDonateFlow();
                setOpen(true);
              }}
              className="rounded-lg bg-[#a95d2b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#954e21] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {clothesOnly ? (visuallyDone ? "Done" : "Contact") : fullyFunded ? "Fully funded" : "Donate"}
            </button>
          </div>
          {!clothesOnly && fullyFunded ? <p className="pt-1 text-xs font-semibold text-emerald-700">Thank you. Fully funded.</p> : null}
          {clothesOnly && visuallyDone ? <p className="pt-1 text-xs font-semibold text-emerald-700">Marked as done.</p> : null}

        </div>
      </Card>

      {adminUnlocked && !clothesOnly ? (
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md border border-rose-200 bg-white/95 px-2 py-1 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
          onClick={async () => {
            if (!confirm("Delete this donation call?")) return;
            const res = await fetch(`/api/dashboard/campaigns/${id}`, { method: "DELETE" });
            if (!res.ok) return;
            router.refresh();
          }}
        >
          Delete
        </button>
      ) : null}
      {adminUnlocked && clothesOnly ? (
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md border border-emerald-300 bg-white/95 px-2 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          onClick={async () => {
            const res = await fetch(`/api/dashboard/campaigns/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ is_done: !visuallyDone }),
            });
            if (!res.ok) return;
            router.refresh();
          }}
        >
          {visuallyDone ? "Undo done" : "Mark as done"}
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h3 className="text-lg font-semibold text-[#61341c]">Donate</h3>

            {clothesOnly ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-[#e3d5c7] bg-[#fffaf5] p-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#7a4b2a]">Phone number</p>
                  <p className="mt-1 break-all text-base font-bold text-[#5f3520]">{contactNumber || "Not provided yet"}</p>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-600">Have you donated before?</p>
                <div className="flex gap-2">
                  <button type="button" className={`rounded-md px-3 py-2 text-sm ${donorType === "new" ? "bg-[#a95d2b] text-white" : "bg-slate-100"}`} onClick={() => setDonorType("new")}>
                    No
                  </button>
                  <button type="button" className={`rounded-md px-3 py-2 text-sm ${donorType === "existing" ? "bg-[#a95d2b] text-white" : "bg-slate-100"}`} onClick={() => setDonorType("existing")}>
                    Yes
                  </button>
                </div>

                {donorType === "new" ? (
                  <>
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Name" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Surname" value={donorSurname} onChange={(e) => setDonorSurname(e.target.value)} />
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder="Email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      placeholder="Short description (e.g. Associate professor at ADA)"
                      value={donorDescription}
                      onChange={(e) => setDonorDescription(e.target.value)}
                    />
                    {!selectedDonorId ? (
                      <button
                        type="button"
                        className="rounded-md bg-[#a95d2b] px-3 py-2 text-sm font-semibold text-white"
                        onClick={async () => {
                          setError(null);
                          const res = await fetch("/api/campaigns/donor-id", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ donorType: "new", donorName, donorSurname, donorEmail, donorDescription }),
                          });
                          const raw = await res.text();
                          const data = raw ? (JSON.parse(raw) as { donorId?: string; donorName?: string; error?: string }) : {};
                          if (!res.ok || !data.donorId) {
                            setError(data.error ?? "Could not create donor profile.");
                            return;
                          }
                          setSelectedDonorId(data.donorId);
                          setSelectedDonorName(data.donorName ?? `${donorName} ${donorSurname}`.trim());
                          setSelectedDonorDescription(donorDescription);
                        }}
                      >
                        Continue
                      </button>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        Donor profile ready for: <span className="font-semibold">{selectedDonorName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder="Email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
                    {!selectedDonorId ? (
                      <button
                        type="button"
                        className="rounded-md border border-[#d7bca5] bg-white px-3 py-2 text-sm font-semibold text-[#7d4d2a]"
                        onClick={async () => {
                          setError(null);
                          const res = await fetch("/api/campaigns/donor-id", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ donorType: "existing", donorEmail }),
                          });
                          const raw = await res.text();
                          const data = raw ? (JSON.parse(raw) as { donorId?: string; donorName?: string; error?: string }) : {};
                          if (!res.ok || !data.donorId) {
                            setError(data.error ?? "Could not find donor by email.");
                            return;
                          }
                          setSelectedDonorId(data.donorId);
                          setSelectedDonorName(data.donorName ?? "Donor");
                          setSelectedDonorDescription("");
                        }}
                      >
                        Continue
                      </button>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        Donor profile ready for: <span className="font-semibold">{selectedDonorName}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}

            {!clothesOnly && step === 2 ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-700">Do you want this donation to be anonymous or show your name?</p>
                <div className="flex gap-2">
                  <button type="button" className={`rounded-md px-3 py-2 text-sm ${visibility === "anonymous" ? "bg-[#a95d2b] text-white" : "bg-slate-100"}`} onClick={() => setVisibility("anonymous")}>Anonymous</button>
                  <button type="button" className={`rounded-md px-3 py-2 text-sm ${visibility === "name" ? "bg-[#a95d2b] text-white" : "bg-slate-100"}`} onClick={() => setVisibility("name")}>Show my name</button>
                </div>
                <div className="rounded-md border border-[#e3d5c7] bg-[#fffaf5] p-2 text-sm text-[#6f5a49]">
                  Selected donor: <span className="font-semibold">{selectedDonorName}</span>
                  {selectedDonorDescription ? <p className="text-xs">{selectedDonorDescription}</p> : null}
                </div>
              </div>
            ) : null}

            {!clothesOnly && step === 3 ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-[#e3d5c7] bg-[#fffaf5] p-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#7a4b2a]">Card number</p>
                  <p className="mt-1 break-all text-base font-bold text-[#5f3520]">{cardNumber || "Not provided yet"}</p>
                </div>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" step="0.01" placeholder="Amount (AZN)" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="rounded-lg border border-[#e3d5c7] bg-[#fffaf5] p-3">
                  <label htmlFor={`receipt-${id}`} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#ddc9b7] bg-white px-3 py-2 text-sm font-semibold text-[#7d4d2a] hover:bg-[#fff3e6]">
                    {isUploadingReceipt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploadingReceipt ? "Uploading..." : "Upload receipt"}
                  </label>
                  <input
                    id={`receipt-${id}`}
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    disabled={isUploadingReceipt}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setError(null);
                      setIsUploadingReceipt(true);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await fetch("/api/uploads/donation-receipt", { method: "POST", body: formData });
                        const raw = await res.text();
                        const data = raw ? (JSON.parse(raw) as { receiptPath?: string; error?: string }) : {};
                        if (!res.ok) {
                          setError(data.error ?? "Could not upload receipt.");
                          return;
                        }
                        setReceiptPath(data.receiptPath ?? "");
                        setReceiptLabel(file.name);
                      } catch {
                        setError("Could not upload receipt.");
                      } finally {
                        setIsUploadingReceipt(false);
                      }
                    }}
                  />
                  <p className="mt-2 text-xs text-[#7b6857]">Receipt is required. PNG, JPG, WEBP, GIF, PDF. Max 10MB.</p>
                  {receiptLabel ? <p className="mt-2 text-sm font-medium text-emerald-700">Uploaded: {receiptLabel}</p> : null}
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md px-3 py-2 text-sm" onClick={() => { setOpen(false); resetDonateFlow(); }}>Close</button>
              {!clothesOnly && step > 1 ? <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}>Back</button> : null}
              {!clothesOnly && step < 3 ? (
                <button
                  type="button"
                  className="rounded-md bg-[#a95d2b] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={step === 1 && !identityReady}
                  onClick={() => {
                    if (step === 1 && !identityReady) return setError("Please complete donor identity first.");
                    setError(null);
                    setStep((prev) => (prev === 1 ? 2 : 3));
                  }}
                >
                  Next
                </button>
              ) : !clothesOnly ? (
                <button
                  type="button"
                  disabled={!canDonate}
                  className="rounded-md bg-[#a95d2b] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    const res = await fetch("/api/campaigns/donate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        campaignId: id,
                        donorName: selectedDonorName,
                        donorId: selectedDonorId,
                        isAnonymous: visibility === "anonymous",
                        amount,
                        receiptPath,
                      }),
                    });
                    const raw = await res.text();
                    setLoading(false);
                    const data = raw ? (JSON.parse(raw) as { thankYou?: string; error?: string }) : {};
                    if (!res.ok) return setError(data.error ?? "Could not process donation.");
                    setThankYouMessage(data.thankYou ?? "Thank you for your donation.");
                    setShowThankYou(true);
                    setOpen(false);
                    router.refresh();
                  }}
                >
                  {loading ? "Processing..." : "Donate"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {!clothesOnly && historyOpen ? (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#61341c]">Donation History</h3>
              <button type="button" className="rounded-md px-2 py-1 text-sm" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
            {historyLoading ? <p className="text-sm text-slate-600">Loading...</p> : null}
            {historyError ? <p className="text-sm text-rose-600">{historyError}</p> : null}
            {!historyLoading && !historyError ? (
              <div className="max-h-[24rem] space-y-2 overflow-y-auto">
                {historyItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#e8dacd] bg-[#fffaf5] p-3 text-sm">
                    <p className="font-semibold text-[#62381f]">{item.donorName}</p>
                    <p className="text-[#6f5a49]">AZN {Number(item.amount ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-[#8a7a6b]">{new Date(item.createdAt).toLocaleString()}</p>
                    {adminUnlocked && item.receiptUrl ? <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-[#8b4e22] underline">View receipt</a> : null}
                  </div>
                ))}
                {!historyItems.length ? <p className="text-sm text-slate-600">No donations yet.</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showThankYou ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2a2017]/85 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Thank you</p>
            <p className="mt-3 whitespace-pre-line text-lg font-medium text-[#3b2b1f]">{thankYouMessage}</p>
            <button type="button" className="mt-6 rounded-lg bg-[#a95d2b] px-5 py-2 text-sm font-semibold text-white" onClick={() => setShowThankYou(false)}>Done</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
