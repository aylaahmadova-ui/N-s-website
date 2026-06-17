export default function ClothesDonationLoading() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-64 animate-pulse rounded-xl bg-[#e3d5c7]" />
          <div className="h-5 w-80 animate-pulse rounded-lg bg-[#e3d5c7]/70" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[#e3d5c7] bg-white/80 p-5 shadow-sm"
            >
              <div className="mb-4 h-40 w-full animate-pulse rounded-2xl bg-[#e3d5c7]/60" />
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded-lg bg-[#e3d5c7]" />
              <div className="mb-4 h-4 w-full animate-pulse rounded-lg bg-[#e3d5c7]/50" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-[#e3d5c7]/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
