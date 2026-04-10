export function getStripePlaceholderConfig() {
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    note: "Replace placeholder buttons with real Stripe Checkout or Payment Intents flows.",
  };
}
