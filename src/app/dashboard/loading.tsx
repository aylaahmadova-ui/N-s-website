export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Nav sidebar skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-xl bg-[#e3d5c7]/60"
            />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#e3d5c7] bg-white/95 p-6">
            <div className="mb-3 h-6 w-48 animate-pulse rounded-lg bg-[#e3d5c7]" />
            <div className="mb-4 h-4 w-72 animate-pulse rounded bg-[#e3d5c7]/50" />
            <div className="h-5 w-36 animate-pulse rounded bg-[#e3d5c7]/40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[#e3d5c7] bg-white/95 p-6">
              <div className="mb-2 h-5 w-32 animate-pulse rounded-lg bg-[#e3d5c7]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#e3d5c7]/50" />
            </div>
            <div className="rounded-3xl border border-[#e3d5c7] bg-white/95 p-6">
              <div className="mb-2 h-5 w-32 animate-pulse rounded-lg bg-[#e3d5c7]" />
              <div className="h-4 w-20 animate-pulse rounded bg-[#e3d5c7]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
