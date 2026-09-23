"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Hero from "./home/hero";
import FeatureStrip from "./home/feature-strip";
import Trusts from "./home/trusts";
import FeatureExplained from "./home/feature-explained";
import FeatureGrid from "./home/feature-grid";
import Integrations from "./home/integrations";
import Comparison from "./home/comparison";
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
          <FeatureExplained />
          <FeatureGrid />
          <Integrations />
          <Comparison />
          <FAQ />
          <CallToAction />
        </main>
      </div>
    </div>
  );
}
