"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Link as LinkIcon,
  Palette,
  GripVertical,
  Trash2,
  Plus,
  Monitor,
  Smartphone,
  ExternalLink,
  Check,
  Loader2,
  Camera,
  Github,
  Twitter,
  Youtube,
  Instagram,
  Pentagon,
} from "lucide-react";
import Link from "next/dist/client/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// --- Types & Mock Data ---
type Theme = "minimal" | "midnight" | "vibrant";
interface ProfileLink {
  id: string;
  title: string;
  url: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function SplitViewEditor() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "links" | "appearance"
  >("profile");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">(
    "mobile",
  );

  // Simulated Auto-Save State
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // --- Real-time Page State ---
  const [theme, setTheme] = useState<Theme>("midnight");
  const [profile, setProfile] = useState({
    name: "Sarah Creative",
    bio: "Digital artist & designer. ✨ Sharing my journey and latest drops.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  });
  const [links, setLinks] = useState<ProfileLink[]>([
    {
      id: "1",
      title: "Latest YouTube Video",
      url: "youtube.com/...",
      icon: <Youtube size={18} />,
      enabled: true,
    },
    {
      id: "2",
      title: "Follow on Twitter",
      url: "twitter.com/...",
      icon: <Twitter size={18} />,
      enabled: true,
    },
    {
      id: "3",
      title: "My Portfolio",
      url: "sarah.design",
      icon: <Globe size={18} />,
      enabled: true,
    },
  ]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  // Simulate Auto-Save trigger when state changes
  useEffect(() => {
    if (!mounted) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => setSaveStatus("saved"), 800);
    return () => clearTimeout(timer);
  }, [profile, links, theme, mounted]);

  if (!mounted) return null;

  // Theme styling maps for the live preview
  const themeStyles = {
    minimal: {
      bg: "bg-[#fafafa]",
      card: "bg-white border-zinc-200",
      text: "text-zinc-900",
      muted: "text-zinc-500",
    },
    midnight: {
      bg: "bg-[#0a0a0a]",
      card: "bg-[#111] border-white/10",
      text: "text-white",
      muted: "text-zinc-400",
    },
    vibrant: {
      bg: "bg-violet-900",
      card: "bg-white/10 border-white/20 backdrop-blur-md",
      text: "text-white",
      muted: "text-violet-200",
    },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      {/* 🛠️ LEFT SIDE: EDITOR CONTROLS (35%) */}
      <aside className="z-20 flex w-[400px] shrink-0 flex-col border-r border-zinc-200 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {/* Editor Header */}
        <div className="flex h-14 shrink-0 items-center border-b border-zinc-200 bg-white px-6 dark:border-white/10 dark:bg-zinc-900">
          <div className="flex w-full items-center justify-between gap-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
            >
              <div className="bg-background text-foreground flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                <Pentagon
                  size={18}
                  strokeWidth={2.5}
                  className="text-foreground"
                />
              </div>
              <span className="text-background dark:text-foreground text-lg font-bold tracking-tight">
                Linkforge
              </span>
            </Link>
            <div>
              <AnimatedThemeToggler className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex shrink-0 gap-6 border-b border-zinc-100 px-6 pt-4 dark:border-white/5">
          <TabButton
            icon={<User size={14} />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <TabButton
            icon={<LinkIcon size={14} />}
            label="Links"
            active={activeTab === "links"}
            onClick={() => setActiveTab("links")}
          />
          <TabButton
            icon={<Palette size={14} />}
            label="Appearance"
            active={activeTab === "appearance"}
            onClick={() => setActiveTab("appearance")}
          />
        </div>

        {/* Dynamic Controls Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in space-y-8 duration-300">
              <div className="flex items-center gap-6">
                <div className="group relative cursor-pointer">
                  <div className="h-20 w-20 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-white/10">
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera size={16} />
                      {/* <input
                        type="file"
                        className="absolute inset-0 cursor-pointer opacity-0"
                      /> */}
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <button className="h-9 w-full rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600">
                    Upload new image
                  </button>
                  <button className="h-9 w-full rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
                    Remove
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Bio
                    </label>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {profile.bio.length}/160
                    </span>
                  </div>
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="flex min-h-[100px] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                  />
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-white/10">
                <h3 className="text-sm font-semibold tracking-wider text-zinc-900 uppercase dark:text-zinc-100">
                  Social Links
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Instagram
                    </label>
                    <div className="relative flex items-center">
                      <Instagram
                        size={14}
                        className="absolute left-3 text-zinc-400 dark:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="username"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Twitter
                    </label>
                    <div className="relative flex items-center">
                      <Twitter
                        size={14}
                        className="absolute left-3 text-zinc-400 dark:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="username"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      YouTube
                    </label>
                    <div className="relative flex items-center">
                      <Youtube
                        size={14}
                        className="absolute left-3 text-zinc-400 dark:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="channel"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      LinkedIn
                    </label>
                    <div className="relative flex items-center">
                      <Github
                        size={14}
                        className="absolute left-3 text-zinc-400 dark:text-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="username"
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-9 text-sm transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:bg-zinc-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === "links" && (
            <div className="animate-in fade-in space-y-6 duration-300">
              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] dark:bg-violet-700 dark:hover:bg-violet-600">
                <Plus size={16} /> Add new link
              </button>

              <div className="space-y-3">
                {links.map((link, idx) => (
                  <div
                    key={link.id}
                    className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-800 dark:hover:border-white/20"
                  >
                    <div className="mt-2 cursor-grab text-zinc-400 hover:text-zinc-900 active:cursor-grabbing dark:hover:text-zinc-100">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[idx].title = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full border-b border-transparent bg-transparent text-sm font-bold transition-colors outline-none hover:border-zinc-200 focus:border-zinc-400 dark:text-zinc-50 dark:hover:border-white/20 dark:focus:border-white/30"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...links];
                          newLinks[idx].url = e.target.value;
                          setLinks(newLinks);
                        }}
                        className="w-full border-b border-transparent bg-transparent text-xs text-zinc-500 transition-colors outline-none hover:border-zinc-200 focus:border-zinc-400 dark:text-zinc-400 dark:hover:border-white/20 dark:focus:border-white/30"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Switch
                        enabled={link.enabled}
                        setEnabled={(val) => {
                          const newLinks = [...links];
                          newLinks[idx].enabled = val;
                          setLinks(newLinks);
                        }}
                      />
                      <button className="text-zinc-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500 dark:text-zinc-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="animate-in fade-in space-y-6 duration-300">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900">Themes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Minimal Theme Option */}
                  <button
                    onClick={() => setTheme("minimal")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all ${theme === "minimal" ? "border-zinc-900 dark:border-zinc-100" : "border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"}`}
                  >
                    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-[#fafafa] p-2 shadow-sm">
                      <div className="h-6 w-6 rounded-full bg-zinc-200" />
                      <div className="h-4 w-full rounded border border-zinc-200 bg-white" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Minimal
                    </span>
                  </button>

                  {/* Midnight Theme Option */}
                  <button
                    onClick={() => setTheme("midnight")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all ${theme === "midnight" ? "border-zinc-900 dark:border-zinc-100" : "border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"}`}
                  >
                    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-[#0a0a0a] p-2 shadow-sm">
                      <div className="h-6 w-6 rounded-full bg-zinc-800" />
                      <div className="h-4 w-full rounded border border-zinc-800 bg-[#111]" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Midnight
                    </span>
                  </button>

                  {/* Vibrant Theme Option */}
                  <button
                    onClick={() => setTheme("vibrant")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all ${theme === "vibrant" ? "border-zinc-900 dark:border-zinc-100" : "border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"}`}
                  >
                    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-violet-800 bg-violet-900 p-2 shadow-sm">
                      <div className="h-6 w-6 rounded-full bg-violet-800" />
                      <div className="h-4 w-full rounded border border-white/20 bg-white/10" />
                    </div>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Vibrant
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 📱 RIGHT SIDE: LIVE PREVIEW (65%) */}
      <main className="relative flex flex-1 flex-col overflow-hidden bg-zinc-100/80 dark:bg-zinc-900/80">
        {/* Preview Action Bar */}
        <div className="absolute inset-x-8 top-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-300">
            {saveStatus === "saving" ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Saving changes...
              </>
            ) : (
              <>
                <Check size={12} className="text-emerald-500" /> All changes
                saved
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-zinc-200 bg-white/80 p-1 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-800/80">
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`rounded-full p-1.5 transition-colors ${previewMode === "mobile" ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
              >
                <Smartphone size={14} />
              </button>
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`rounded-full p-1.5 transition-colors ${previewMode === "desktop" ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
              >
                <Monitor size={14} />
              </button>
            </div>

            <a
              href="#"
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Share <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
          {/* THE DEVICE MOCKUP */}
          <div
            className={`relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              previewMode === "mobile"
                ? "h-[680px] w-[320px] rounded-[3rem] border-[10px] border-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                : "h-[80%] w-full max-w-3xl rounded-2xl border border-zinc-200 shadow-2xl"
            } ${currentTheme.bg}`}
          >
            {/* Notch (Mobile Only) */}
            {previewMode === "mobile" && (
              <div className="absolute inset-x-0 top-0 z-20 mx-16 h-6 rounded-b-xl bg-zinc-900" />
            )}

            {/* LIVE REACTIVE CONTENT (Matches the public profile design exactly) */}
            <div className="custom-scrollbar animate-in fade-in relative z-10 flex h-full w-full flex-col items-center overflow-y-auto px-6 pt-16 pb-12 duration-500">
              {/* Profile Hero */}
              <div className="mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-400 p-1 shadow-sm dark:from-zinc-700 dark:to-zinc-800">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className={`h-full w-full rounded-full border-[3px] object-cover ${theme === "midnight" ? "border-[#0a0a0a]" : "border-white"}`}
                />
              </div>

              <h1
                className={`mb-2 text-center text-xl font-bold tracking-tight ${currentTheme.text}`}
              >
                {profile.name || "Your Name"}
              </h1>

              <p
                className={`mb-8 max-w-sm text-center text-[13px] leading-relaxed font-medium ${currentTheme.muted}`}
              >
                {profile.bio || "Your bio goes here."}
              </p>

              {/* Reactive Links Array */}
              <div className="w-full space-y-3">
                {links
                  .filter((l) => l.enabled)
                  .map((link) => (
                    <a
                      key={link.id}
                      href="#"
                      className={`block flex w-full items-center gap-3 rounded-xl border p-3 shadow-sm transition-transform hover:scale-[1.02] ${currentTheme.card}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-current opacity-80 dark:bg-black/20">
                        {link.icon}
                      </div>
                      <span
                        className={`truncate text-[13px] font-semibold ${currentTheme.text}`}
                      >
                        {link.title || "Untitled Link"}
                      </span>
                    </a>
                  ))}
              </div>

              {/* Watermark */}
              <div className="mt-12 flex items-center gap-1.5 opacity-50">
                <LinkIcon size={10} className={currentTheme.text} />
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${currentTheme.text}`}
                >
                  Linkforge
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Atomic Helpers ---
const TabButton = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 pb-4 text-sm font-semibold transition-colors ${
      active
        ? "text-zinc-950 dark:text-zinc-50"
        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
    }`}
  >
    {icon} {label}
    {active && (
      <span className="absolute right-0 bottom-[-1px] left-0 h-0.5 rounded-t-full bg-zinc-950 dark:bg-zinc-50" />
    )}
  </button>
);

const Switch = ({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
}) => (
  <button
    onClick={() => setEnabled(!enabled)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
      enabled ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"
    }`}
  >
    <span
      className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform dark:bg-zinc-900 ${enabled ? "translate-x-4" : "translate-x-0.5"}`}
    />
  </button>
);

// Globe icon fallback for UI
const Globe = ({ size, className }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);
