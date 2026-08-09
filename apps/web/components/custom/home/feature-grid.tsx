import {
  Activity,
  ExternalLink,
  GripVertical,
  LinkIcon,
  Palette,
  Search,
  Smartphone,
  User,
} from "lucide-react";
import React from "react";

const FeatureGrid = () => {
  return (
    <section className="border-y border-zinc-200 bg-white py-24 dark:border-white/5 dark:bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Everything included
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {[
            {
              icon: <LinkIcon />,
              title: "Unlimited Links",
              desc: "Add as many links as you need.",
            },
            {
              icon: <GripVertical />,
              title: "Drag & Reorder",
              desc: "Organize with a simple drag.",
            },
            {
              icon: <Palette />,
              title: "Theme System",
              desc: "8 premium built-in themes.",
            },
            {
              icon: <Smartphone />,
              title: "Mobile Optimized",
              desc: "Looks perfect on any screen.",
            },
            {
              icon: <Search />,
              title: "SEO Friendly",
              desc: "Metadata generated automatically.",
            },
            {
              icon: <User />,
              title: "Custom Usernames",
              desc: "Claim your unique identity.",
            },
            {
              icon: <ExternalLink />,
              title: "Fast Redirects",
              desc: "Zero latency link routing.",
            },
            {
              icon: <Activity />,
              title: "Privacy Focused",
              desc: "No invasive ad tracking.",
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col">
              <div className="mb-3 text-zinc-900 opacity-80 dark:text-white">
                {item.icon}
              </div>
              <h4 className="mb-1.5 text-base font-bold text-zinc-950 dark:text-white">
                {item.title}
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
