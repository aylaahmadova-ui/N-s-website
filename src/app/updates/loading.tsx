export default function UpdatesLoading() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-40 animate-pulse rounded-xl bg-[#e3d5c7]" />
          <div className="h-5 w-72 animate-pulse rounded-lg bg-[#e3d5c7]/70" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[#e3d5c7] bg-white/80 p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-5 w-28 animate-pulse rounded bg-[#e3d5c7]/60" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#e3d5c7]/40" />
              </div>
              <div className="mb-2 h-5 w-2/3 animate-pulse rounded-lg bg-[#e3d5c7]" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[#e3d5c7]/50" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-[#e3d5c7]/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
