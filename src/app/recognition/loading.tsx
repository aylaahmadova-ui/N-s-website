export default function RecognitionLoading() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto h-9 w-64 animate-pulse rounded-xl bg-[#e3d5c7]" />
          <div className="mx-auto h-5 w-96 animate-pulse rounded-lg bg-[#e3d5c7]/70" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-[#e3d5c7] bg-white/80 px-5 py-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#e3d5c7]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-[#e3d5c7]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[#e3d5c7]/50" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-lg bg-[#e3d5c7]/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
