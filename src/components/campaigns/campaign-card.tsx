"use client";

import { useState } from "react";
import { HandCoins, History, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { compressImage } from "@/lib/image";

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
  const { t } = useLanguage();
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
        className={`flex h-[23.5rem] w-full min-w-0 max-w-none flex-col overflow-hidden rounded-3xl glass-panel glass-panel-hover p-0 md:w-[16.5rem] md:max-w-[16.5rem] md:min-w-[16.5rem] ${visuallyDone ? "grayscale-[0.35] opacity-75" : ""}`}
      >
        <div className={`m-3 overflow-hidden rounded-2xl bg-[#f4e8dc] ${clothesOnly ? "h-44 md:h-40" : "h-36"}`}>
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
          <h2 className="text-base font-bold leading-tight text-[#5c3418]">{title}</h2>
          <p className="mt-1 line-clamp-2 text-xs text-[#735847]">{summary}</p>
          {!clothesOnly ? <p className="pt-1 text-sm font-bold text-[#8b4e22]">{t.common.raised} AZN {Number(amountRaised ?? 0).toFixed(2)} / AZN {Number(amountNeeded ?? 0).toFixed(2)}</p> : null}

          <div className="mt-auto flex items-center gap-2 pt-2">
            {!clothesOnly ? (
              <button type="button" onClick={openHistory} className="rounded-xl border border-[#e3d5c7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#623a1f] transition hover:bg-[#fdf7f1]">
                <span className="inline-flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  {t.donation.history}
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
              className="rounded-xl bg-[#a56131] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#8e4f25] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {clothesOnly ? (visuallyDone ? t.donation.done : t.donation.contact) : fullyFunded ? t.donation.fullyFunded : t.donation.donate}
            </button>
          </div>
          {!clothesOnly && fullyFunded ? <p className="pt-1 text-xs font-semibold text-emerald-700">{t.donation.thankYouFunded}</p> : null}
          {clothesOnly && visuallyDone ? <p className="pt-1 text-xs font-semibold text-emerald-700">{t.donation.markedDone}</p> : null}

        </div>
      </Card>

      {adminUnlocked && !clothesOnly ? (
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md border border-rose-200 bg-white/95 px-2 py-1 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
          onClick={async () => {
            if (!confirm(t.donation.deleteConfirm)) return;
            const res = await fetch(`/api/dashboard/campaigns/${id}`, { method: "DELETE" });
            if (!res.ok) return;
            router.refresh();
          }}
        >
          {t.donation.delete}
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
          {visuallyDone ? t.donation.undoDone : t.donation.markAsDone}
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h3 className="text-lg font-semibold text-[#61341c]">{t.donation.donate}</h3>

            {clothesOnly ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-[#e3d5c7] bg-[#fffaf5] p-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#7a4b2a]">{t.donation.phoneLabel}</p>
                  <p className="mt-1 break-all text-base font-bold text-[#5f3520]">{contactNumber || "Not provided yet"}</p>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-600">{t.donation.donatedBefore}</p>
                <div className="flex gap-2">
                  <button type="button" className={`rounded-xl px-3 py-2 text-sm transition ${donorType === "new" ? "bg-[#a56131] text-white" : "bg-[#fcf7f1] border border-[#e3d5c7] text-[#623a1f]"}`} onClick={() => setDonorType("new")}>
                    {t.donation.no}
                  </button>
                  <button type="button" className={`rounded-xl px-3 py-2 text-sm transition ${donorType === "existing" ? "bg-[#a56131] text-white" : "bg-[#fcf7f1] border border-[#e3d5c7] text-[#623a1f]"}`} onClick={() => setDonorType("existing")}>
                    {t.donation.yes}
                  </button>
                </div>

                {donorType === "new" ? (
                  <>
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder={t.donation.name} value={donorName} onChange={(e) => setDonorName(e.target.value)} />
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder={t.donation.surname} value={donorSurname} onChange={(e) => setDonorSurname(e.target.value)} />
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder={t.donation.email} value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                      placeholder={t.donation.descriptionPlaceholder}
                      value={donorDescription}
                      onChange={(e) => setDonorDescription(e.target.value)}
                    />
                    {!selectedDonorId ? (
                      <button
                        type="button"
                        className="rounded-xl bg-[#a56131] hover:bg-[#8e4f25] px-4 py-2.5 text-sm font-semibold text-white transition"
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
                            setError(data.error ?? t.donation.couldNotCreate);
                            return;
                          }
                          setSelectedDonorId(data.donorId);
                          setSelectedDonorName(data.donorName ?? `${donorName} ${donorSurname}`.trim());
                          setSelectedDonorDescription(donorDescription);
                        }}
                      >
                        {t.donation.continue}
                      </button>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        {t.donation.profileReady} <span className="font-semibold">{selectedDonorName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder={t.donation.email} value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
                    {!selectedDonorId ? (
                      <button
                        type="button"
                        className="rounded-xl border border-[#e3d5c7] bg-white px-4 py-2.5 text-sm font-semibold text-[#623a1f] hover:bg-[#fdf7f1] transition"
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
                            setError(data.error ?? t.donation.couldNotFind);
                            return;
                          }
                          setSelectedDonorId(data.donorId);
                          setSelectedDonorName(data.donorName ?? "Donor");
                          setSelectedDonorDescription("");
                        }}
                      >
                        {t.donation.continue}
                      </button>
                    ) : (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                        {t.donation.profileReady} <span className="font-semibold">{selectedDonorName}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}

            {!clothesOnly && step === 2 ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-700">{t.donation.visibilityQuestion}</p>
                <div className="flex gap-2">
                  <button type="button" className={`rounded-xl px-3 py-2 text-sm transition ${visibility === "anonymous" ? "bg-[#a56131] text-white" : "bg-[#fcf7f1] border border-[#e3d5c7] text-[#623a1f]"}`} onClick={() => setVisibility("anonymous")}>{t.donation.anonymous}</button>
                  <button type="button" className={`rounded-xl px-3 py-2 text-sm transition ${visibility === "name" ? "bg-[#a56131] text-white" : "bg-[#fcf7f1] border border-[#e3d5c7] text-[#623a1f]"}`} onClick={() => setVisibility("name")}>{t.donation.showMyName}</button>
                </div>
                <div className="rounded-md border border-[#e3d5c7] bg-[#fffaf5] p-2 text-sm text-[#6f5a49]">
                  {t.donation.selectedDonor} <span className="font-semibold">{selectedDonorName}</span>
                  {selectedDonorDescription ? <p className="text-xs">{selectedDonorDescription}</p> : null}
                </div>
              </div>
            ) : null}

            {!clothesOnly && step === 3 ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-[#e3d5c7] bg-[#fffaf5] p-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#7a4b2a]">{t.donation.cardNumberLabel}</p>
                  <p className="mt-1 break-all text-base font-bold text-[#5f3520]">{cardNumber || t.donation.cardNumberMissing}</p>
                </div>
                <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="number" min="1" step="0.01" placeholder={t.donation.amountPlaceholder} value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="rounded-2xl border border-[#e3d5c7] bg-[#fffaf6] p-4 shadow-sm">
                  <label htmlFor={`receipt-${id}`} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e3d5c7] bg-white px-3 py-2 text-sm font-semibold text-[#623a1f] hover:bg-[#fdf7f1] transition">
                    {isUploadingReceipt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploadingReceipt ? t.donation.uploading : t.donation.uploadReceipt}
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
                        // Compress receipt image before upload to avoid storage limit
                        const compressedFile = await compressImage(file);
                        const formData = new FormData();
                        formData.append("file", compressedFile);
                        const res = await fetch("/api/uploads/donation-receipt", { method: "POST", body: formData });
                        const raw = await res.text();
                        const data = raw ? (JSON.parse(raw) as { receiptPath?: string; error?: string }) : {};
                        if (!res.ok) {
                          setError(data.error ?? t.donation.couldNotCreate);
                          return;
                        }
                        setReceiptPath(data.receiptPath ?? "");
                        setReceiptLabel(compressedFile.name);
                      } catch {
                        setError(t.donation.couldNotCreate);
                      } finally {
                        setIsUploadingReceipt(false);
                      }
                    }}
                  />
                  <p className="mt-2 text-xs text-[#7b6857]">{t.donation.receiptHint}</p>
                  {receiptLabel ? <p className="mt-2 text-sm font-medium text-emerald-700">{t.donation.uploaded} {receiptLabel}</p> : null}
                </div>
              </div>
            ) : null}

            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

            <div className="mt-5 flex justify-end gap-2 border-t border-[#e3d5c7]/40 pt-4">
              <button type="button" className="rounded-xl border border-[#e3d5c7] bg-white px-4 py-2 text-sm font-semibold text-[#623a1f] hover:bg-[#fdf7f1] transition" onClick={() => { setOpen(false); resetDonateFlow(); }}>{t.donation.close}</button>
              {!clothesOnly && step > 1 ? <button type="button" className="rounded-xl border border-[#e3d5c7] bg-white px-4 py-2 text-sm font-semibold text-[#623a1f] hover:bg-[#fdf7f1] transition" onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}>{t.donation.back}</button> : null}
              {!clothesOnly && step < 3 ? (
                <button
                  type="button"
                  className="rounded-xl bg-[#a56131] hover:bg-[#8e4f25] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={step === 1 && !identityReady}
                  onClick={() => {
                    if (step === 1 && !identityReady) return setError(t.donation.completeIdentity);
                    setError(null);
                    setStep((prev) => (prev === 1 ? 2 : 3));
                  }}
                >
                  {t.donation.next}
                </button>
              ) : !clothesOnly ? (
                <button
                  type="button"
                  disabled={!canDonate}
                  className="rounded-xl bg-[#a56131] hover:bg-[#8e4f25] px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
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
                  {loading ? t.donation.processing : t.donation.donate}
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
              <h3 className="text-lg font-semibold text-[#61341c]">{t.donation.donationHistory}</h3>
              <button type="button" className="rounded-md px-2 py-1 text-sm" onClick={() => setHistoryOpen(false)}>{t.donation.close}</button>
            </div>
            {historyLoading ? <p className="text-sm text-slate-600">{t.donation.loading}</p> : null}
            {historyError ? <p className="text-sm text-rose-600">{historyError}</p> : null}
            {!historyLoading && !historyError ? (
              <div className="max-h-[24rem] space-y-2 overflow-y-auto">
                {historyItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-[#e8dacd] bg-[#fffaf5] p-3 text-sm">
                    <p className="font-semibold text-[#62381f]">{item.donorName}</p>
                    <p className="text-[#6f5a49]">AZN {Number(item.amount ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-[#8a7a6b]">{new Date(item.createdAt).toLocaleString()}</p>
                    {adminUnlocked && item.receiptUrl ? <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-[#8b4e22] underline">{t.donation.viewReceipt}</a> : null}
                  </div>
                ))}
                {!historyItems.length ? <p className="text-sm text-slate-600">{t.donation.noDonations}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showThankYou ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2a2017]/85 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">{t.donation.thankYouFunded.split(".")[0]}</p>
            <p className="mt-3 whitespace-pre-line text-lg font-medium text-[#3b2b1f]">{thankYouMessage}</p>
            <button type="button" className="mt-6 rounded-lg bg-[#a95d2b] px-5 py-2 text-sm font-semibold text-white" onClick={() => setShowThankYou(false)}>{t.donation.done}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
