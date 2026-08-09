export type ThemeKey =
  | "default"
  | "dark"
  | "light"
  | "violet"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight";

// Base background and text colors for the page
export const THEMES: Record<ThemeKey, string> = {
  default: "bg-zinc-50 text-zinc-950",
  dark: "bg-[#0a0a0a] text-zinc-50",
  light: "bg-white text-zinc-950",
  violet: "bg-zinc-950 text-violet-50",
  ocean: "bg-slate-950 text-cyan-50",
  sunset: "bg-orange-50 text-orange-950",
  forest: "bg-[#f0fdf4] text-green-950", // soft green
  midnight: "bg-[#050505] text-zinc-300",
};

// Specific styles for the link buttons
export const THEME_BUTTONS: Record<ThemeKey, string> = {
  default:
    "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:-translate-y-0.5 shadow-sm",
  dark: "bg-[#111] border border-white/10 text-white hover:bg-white/5 hover:-translate-y-0.5 shadow-sm",
  light:
    "bg-zinc-950 text-white hover:bg-zinc-800 hover:-translate-y-0.5 shadow-sm",
  violet:
    "bg-violet-600 border border-violet-500 text-white hover:bg-violet-500 hover:-translate-y-0.5 shadow-md shadow-violet-900/20",
  ocean:
    "bg-cyan-600 border border-cyan-500 text-white hover:bg-cyan-500 hover:-translate-y-0.5 shadow-md shadow-cyan-900/20",
  sunset:
    "bg-orange-500 border border-orange-400 text-white hover:bg-orange-400 hover:-translate-y-0.5 shadow-md shadow-orange-900/10",
  forest:
    "bg-green-600 border border-green-500 text-white hover:bg-green-500 hover:-translate-y-0.5 shadow-md shadow-green-900/10",
  midnight:
    "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 shadow-sm",
};
