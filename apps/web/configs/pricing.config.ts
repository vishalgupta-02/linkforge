export interface PricingPlan {
  id: "FREE" | "PRO";
  name: string;
  price: string;
  interval: string;
  description: string;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    interval: "/ forever",
    description: "For getting started and sharing basics.",
    features: [
      "Up to 8 links",
      "Basic themes (Light & Dark)",
      "Public profile page",
      "Basic click analytics (7 days)",
    ],
    ctaLabel: "Get started for free",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹299",
    interval: "/ month",
    description: "For growing creators who need full control.",
    popular: true,
    features: [
      "Unlimited links & embeds",
      "All 8 premium themes",
      "Advanced analytics (1 year history)",
      "Live real-time visitor presence",
      "Deep customization options",
      "Priority support",
    ],
    ctaLabel: "Upgrade to Pro",
  },
];
