import {
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  Package,
  ShieldCheck,
  TrendingUp,
  HandCoins,
  HandHeart,
} from "lucide-react";

const offerings = [
  {
    title: "Marketplace",
    description: "Handmade products created by children, available for purchase.",
    icon: Package,
  },
  {
    title: "Donation Campaigns",
    description: "Support specific needs with clear goals and transparency.",
    icon: HeartHandshake,
  },
  {
    title: "Idea Funding",
    description: "Help bring children's ideas and projects to life.",
    icon: Lightbulb,
  },
  {
    title: "Progress Updates",
    description: "Track how contributions are used through real updates.",
    icon: TrendingUp,
  },
  {
    title: "Verified System",
    description: "All activity is managed by trusted foster homes and organizations.",
    icon: ShieldCheck,
  },
];

const impactItems = [
  { label: "Safe Child Profiles", icon: ShieldCheck, tone: "bg-[#f6e8da]" },
  { label: "Verified Campaigns", icon: HandCoins, tone: "bg-[#f9eadf]" },
  { label: "Real Updates", icon: TrendingUp, tone: "bg-[#f7e7da]" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-6 py-14 text-[#3f2c1d] md:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-[#e3d5c7] bg-[linear-gradient(145deg,#fcf7f1,#f3e5d7)] p-7 shadow-[0_22px_50px_rgba(120,74,41,0.10)] md:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e0cfbc] bg-[#f7ebdf] px-4 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[#9c5f30]">
            <CheckCircle2 className="h-4 w-4" />
            About Us
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#5c3418] md:text-5xl">Kindora</h1>

              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#735847] md:text-lg">
                <p>
                  Kindora is a supervised platform where children in foster care can create, earn, and grow in a safe
                  and supportive environment.
                </p>
                <p>
                  Through verified foster homes and organizations, children can share handmade products, raise support
                  for real needs, and fund ideas they want to turn into reality. Supporters can shop, donate, and
                  directly see the impact of their contributions through transparent updates.
                </p>
                <p>
                  We are not just a charity platform. Kindora combines commerce, support, and opportunity while
                  ensuring safety, accountability, and dignity at every step.
                </p>
                <p className="font-semibold text-[#ad622e]">
                  Our goal is simple: to give every child the chance to build something of their own and shape a better
                  future.
                </p>
              </div>
            </div>

            <div className="space-y-4 lg:pt-10">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {impactItems.map((item) => (
                  <div key={item.label} className={`rounded-2xl border border-[#e2d2c1] p-4 ${item.tone}`}>
                    <item.icon className="h-5 w-5 text-[#a56131]" />
                    <p className="mt-2 text-sm font-semibold text-[#6f4629]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold text-[#5b341a] md:text-4xl">What We Offer</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {offerings.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e3d5c7] bg-[#fffaf3] p-5 shadow-[0_12px_28px_rgba(113,73,43,0.08)]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#f8ebdd] p-2">
                    <item.icon className="h-5 w-5 text-[#a56131]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#623a1f]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#775c49] md:text-base">{item.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-[#e3d5c7] bg-[#fff9f2] p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-full bg-[#f7ebdd] p-3">
              <HandHeart className="h-5 w-5 text-[#a56131]" />
            </div>
            <p className="text-base text-[#745947] md:text-lg">
              Kindora is built to protect dignity while unlocking opportunity through safe creativity, supervised support,
              and accountable impact.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
