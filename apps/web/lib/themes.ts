import type { ThemeKey } from "@vyrex/types";

export type { ThemeKey };

export const THEMES: Record<ThemeKey, string> = {
  default: "bg-zinc-50 text-zinc-950",
  dark: "bg-[#0a0a0a] text-zinc-50",
  light: "bg-white text-zinc-950",
  violet: "bg-zinc-950 text-violet-50",
  ocean: "bg-slate-950 text-cyan-50",
  sunset: "bg-orange-50 text-orange-950",
  forest: "bg-[#f0fdf4] text-green-950", 
  midnight: "bg-[#050505] text-zinc-300",
};

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

export interface ThemeMeta {
  key: ThemeKey;
  name: string;
  tagline: string;
  isPro: boolean;
  bgHex: string;
  accentHex: string;
  cardHex: string;
  textColor: string;
}

export const THEME_LIST: ThemeMeta[] = [
  {
    key: "default",
    name: "Classic Slate",
    tagline: "Clean, neutral zinc balance",
    isPro: false,
    bgHex: "#fafafa",
    accentHex: "#18181b",
    cardHex: "#ffffff",
    textColor: "#18181b",
  },
  {
    key: "dark",
    name: "Obsidian Dark",
    tagline: "Sleek contrast with soft borders",
    isPro: false,
    bgHex: "#0a0a0a",
    accentHex: "#ffffff",
    cardHex: "#111111",
    textColor: "#fafafa",
  },
  {
    key: "light",
    name: "Alabaster Clean",
    tagline: "Pure editorial white minimal",
    isPro: false,
    bgHex: "#ffffff",
    accentHex: "#09090b",
    cardHex: "#f4f4f5",
    textColor: "#09090b",
  },
  {
    key: "violet",
    name: "Tokyo Neon",
    tagline: "Electric purple glowing aesthetics",
    isPro: true,
    bgHex: "#09090b",
    accentHex: "#8b5cf6",
    cardHex: "#7c3aed",
    textColor: "#f5f3ff",
  },
  {
    key: "ocean",
    name: "Cyberpunk Cyan",
    tagline: "Deep maritime dark with vivid cyan",
    isPro: true,
    bgHex: "#020617",
    accentHex: "#06b6d4",
    cardHex: "#0891b2",
    textColor: "#ecfeff",
  },
  {
    key: "sunset",
    name: "Sunset Horizon",
    tagline: "Warm amber dusk and rich coral",
    isPro: true,
    bgHex: "#fff7ed",
    accentHex: "#f97316",
    cardHex: "#ea580c",
    textColor: "#7c2d12",
  },
  {
    key: "forest",
    name: "Emerald Garden",
    tagline: "Lush botanical green accents",
    isPro: true,
    bgHex: "#f0fdf4",
    accentHex: "#16a34a",
    cardHex: "#15803d",
    textColor: "#14532d",
  },
  {
    key: "midnight",
    name: "Deep Void",
    tagline: "Ultra-dark high-contrast monochrome",
    isPro: true,
    bgHex: "#050505",
    accentHex: "#e4e4e7",
    cardHex: "#18181b",
    textColor: "#d4d4d8",
  },
];

