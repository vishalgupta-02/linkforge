"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ArrowRight } from "lucide-react";
import Hero from "./home/hero";
import FeatureStrip from "./home/feature-strip";
import Trusts from "./home/trusts";
import Usecases from "./home/usecases";
import FeatureExplained from "./home/feature-explained";
import FeatureGrid from "./home/feature-grid";
import Integrations from "./home/integrations";
import Comparison from "./home/comparison";
import Pricing from "./home/pricing";
import FAQ from "./home/faq";
import CallToAction from "./home/call-to-action";

export default function UltimateCreatorLanding() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyCTA(window.scrollY > 700);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="relative min-h-screen bg-zinc-50 font-sans text-zinc-950 transition-colors duration-300 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <main>
          <Hero />
          <FeatureStrip />
          <Trusts />
          <Usecases />
          <FeatureExplained />
          <FeatureGrid />
          <Integrations />
          <Comparison />
          <Pricing />
          <FAQ />
          <CallToAction />
        </main>

        {/* <div
          className={`fixed right-6 bottom-6 z-50 transform transition-all duration-300 ${showStickyCTA ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"}`}
        >
          <button className="flex h-12 items-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all hover:scale-[1.03] active:scale-[0.97] dark:bg-white dark:text-black dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)]">
            Claim link <ArrowRight size={16} />
          </button>
        </div> */}
      </div>
    </div>
  );
}
