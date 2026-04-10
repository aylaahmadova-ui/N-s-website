import Link from "next/link";
import { HandHeart, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] text-[#3f2c1d]">
      <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl flex-col items-center justify-center px-6 py-16 text-center lg:px-10">
        <div className="animate-gentle-float mb-6 rounded-full bg-[#f7ebdd] p-7">
          <Sparkles className="h-14 w-14 text-[#a56131]" />
        </div>

        <p className="rounded-full border border-[#e0cfbc] bg-[#f7ebdf] px-8 py-3 text-sm font-bold tracking-[0.14em] text-[#9c5f30]">
          SUPERVISED SUPPORT PLATFORM
        </p>

        <h1 className="mt-7 text-5xl font-extrabold tracking-tight text-[#5c3418] md:text-7xl">
          Welcome to <span className="text-[#a56131]">Kindora</span>
        </h1>
        <p className="mt-6 max-w-4xl text-xl text-[#735847] md:text-3xl">
          A supervised platform where foster children can sell their creations, receive support, and fund their ideas
          through verified organizations.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/apply"
            className="rounded-full bg-[#a56131] px-12 py-4 text-lg font-bold text-white shadow-[0_14px_36px_rgba(120,74,41,0.25)] transition hover:bg-[#8e4f25]"
          >
            Contact
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[#e3d5c7] bg-white px-12 py-4 text-lg font-bold text-[#623a1f] transition hover:bg-[#fdf7f1]"
          >
            Browse Features
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[#6f4629]">
          <HandHeart className="h-5 w-5" />
          <p className="text-sm font-medium tracking-wide">Safe. Verified. Child-Protective.</p>
        </div>
      </section>
    </div>
  );
}
