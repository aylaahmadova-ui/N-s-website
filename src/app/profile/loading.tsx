export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile header skeleton */}
        <div className="rounded-3xl border border-[#e3d5c7] bg-white/80 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-[#e3d5c7]" />
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-[#e3d5c7]" />
              <div className="h-4 w-56 animate-pulse rounded bg-[#e3d5c7]/60" />
            </div>
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#e3d5c7] bg-white/80 p-5"
            >
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#e3d5c7]/60" />
              <div className="h-8 w-16 animate-pulse rounded-lg bg-[#e3d5c7]" />
            </div>
          ))}
        </div>
        {/* Donation history skeleton */}
        <div className="rounded-3xl border border-[#e3d5c7] bg-white/80 p-6">
          <div className="mb-4 h-6 w-44 animate-pulse rounded-lg bg-[#e3d5c7]" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[#e3d5c7]/30 pb-3">
                <div className="space-y-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-[#e3d5c7]" />
                  <div className="h-3 w-24 animate-pulse rounded bg-[#e3d5c7]/50" />
                </div>
                <div className="h-5 w-20 animate-pulse rounded-lg bg-[#e3d5c7]/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
