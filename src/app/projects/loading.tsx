export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-[#e3d5c7]" />
        <div className="h-5 w-80 animate-pulse rounded-lg bg-[#e3d5c7]/70" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-[#e3d5c7] bg-white/95 p-6 shadow-sm"
          >
            <div className="mb-3 h-5 w-2/3 animate-pulse rounded-lg bg-[#e3d5c7]" />
            <div className="mb-4 h-4 w-full animate-pulse rounded bg-[#e3d5c7]/50" />
            <div className="mb-2 h-3 w-32 animate-pulse rounded bg-[#e3d5c7]/40" />
            <div className="h-3 w-48 animate-pulse rounded bg-[#e3d5c7]/40" />
            <div className="mt-3 h-9 w-36 animate-pulse rounded-md bg-[#e3d5c7]/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
