"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Github,
  Twitch,
  Disc as DiscordIcon,
  Music,
  Facebook,
  Send,
  Mail,
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  X,
} from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type { DragEndEvent } from "@dnd-kit/react";
import {
  useSocialLinks,
  useSocialLinkMutations,
} from "@/hooks/use-social-links";
import type { SocialLink } from "@vyrex/types";
import { toast } from "sonner";

export interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  placeholder: string;
  urlPrefix?: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-500 hover:text-pink-600 bg-pink-500/10",
    placeholder: "instagram.com/username or @username",
    urlPrefix: "https://instagram.com/",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-sky-500 hover:text-sky-600 bg-sky-500/10",
    placeholder: "x.com/username or @username",
    urlPrefix: "https://x.com/",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-red-500 hover:text-red-600 bg-red-500/10",
    placeholder: "youtube.com/@channel",
    urlPrefix: "https://youtube.com/@",
  },
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    color: "text-zinc-800 dark:text-zinc-200 bg-zinc-500/10",
    placeholder: "github.com/username",
    urlPrefix: "https://github.com/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-600 hover:text-blue-700 bg-blue-600/10",
    placeholder: "linkedin.com/in/username",
    urlPrefix: "https://linkedin.com/in/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music,
    color: "text-rose-500 hover:text-rose-600 bg-rose-500/10",
    placeholder: "tiktok.com/@username",
    urlPrefix: "https://tiktok.com/@",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: Twitch,
    color: "text-purple-500 hover:text-purple-600 bg-purple-500/10",
    placeholder: "twitch.tv/channel",
    urlPrefix: "https://twitch.tv/",
  },
  {
    id: "discord",
    name: "Discord",
    icon: DiscordIcon,
    color: "text-indigo-500 hover:text-indigo-600 bg-indigo-500/10",
    placeholder: "discord.gg/invitecode",
    urlPrefix: "https://discord.gg/",
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: Music,
    color: "text-emerald-500 hover:text-emerald-600 bg-emerald-500/10",
    placeholder: "open.spotify.com/artist/...",
    urlPrefix: "https://open.spotify.com/",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-500 hover:text-blue-600 bg-blue-500/10",
    placeholder: "facebook.com/username",
    urlPrefix: "https://facebook.com/",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "text-sky-400 hover:text-sky-500 bg-sky-400/10",
    placeholder: "t.me/username",
    urlPrefix: "https://t.me/",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "text-amber-500 hover:text-amber-600 bg-amber-500/10",
    placeholder: "yourname@example.com",
    urlPrefix: "mailto:",
  },
  {
    id: "website",
    name: "Website / Other",
    icon: Globe,
    color: "text-violet-500 hover:text-violet-600 bg-violet-500/10",
    placeholder: "https://yourwebsite.com",
    urlPrefix: "https://",
  },
];

export const getPlatformConfig = (platformId: string): PlatformConfig => {
  const normalized = (platformId || "").toLowerCase().trim();
  const matched = PLATFORMS.find(
    (p) => p.id === normalized || (normalized === "x" && p.id === "twitter"),
  );
  return (
    matched || {
      id: normalized || "custom",
      name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
      icon: Globe,
      color: "text-violet-500 bg-violet-500/10",
      placeholder: "https://example.com",
      urlPrefix: "https://",
    }
  );
};

export function SocialMediaManager() {
  const { data: serverSocials, isLoading } = useSocialLinks();
  const { createSocial, updateSocial, deleteSocial, reorderSocials } =
    useSocialLinkMutations();

  const [items, setItems] = useState<SocialLink[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("instagram");
  const [inputUrl, setInputUrl] = useState("");
  const [searchPlatform, setSearchPlatform] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (serverSocials) {
      const sorted = [...serverSocials].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      );
      setItems(sorted);
    }
  }, [serverSocials]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (event.canceled) return;

      const currentList = Array.isArray(items) ? items : [];
      const moved = move(currentList, event);
      if (!Array.isArray(moved)) return;

      const updatedList: SocialLink[] = moved.map((item, idx) => ({
        ...item,
        position: idx,
      }));

      setItems(updatedList);

      const socialIds = updatedList.map((s) => s.id);
      try {
        await reorderSocials.mutateAsync(socialIds);
      } catch (err) {
        console.error("Failed to reorder social links:", err);
      }
    },
    [items, reorderSocials],
  );

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a username or URL");
      return;
    }

    const platformConfig = getPlatformConfig(selectedPlatform);
    let finalUrl = trimmed;

    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("mailto:")
    ) {
      if (selectedPlatform === "email") {
        finalUrl = `mailto:${trimmed.replace(/^mailto:/, "")}`;
      } else if (trimmed.startsWith("@")) {
        finalUrl = `${platformConfig.urlPrefix || "https://"}${trimmed.slice(1)}`;
      } else {
        finalUrl = `${platformConfig.urlPrefix || "https://"}${trimmed}`;
      }
    }

    try {
      await createSocial.mutateAsync({
        platform: selectedPlatform,
        url: finalUrl,
        position: items.length,
        isActive: true,
      });

      setInputUrl("");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleActive = async (social: SocialLink) => {
    const nextActive = !social.isActive;

    setItems((prev) =>
      prev.map((item) =>
        item.id === social.id ? { ...item, isActive: nextActive } : item,
      ),
    );

    try {
      await updateSocial.mutateAsync({
        id: social.id,
        isActive: nextActive,
      });
    } catch {

      setItems((prev) =>
        prev.map((item) =>
          item.id === social.id ? { ...item, isActive: social.isActive } : item,
        ),
      );
    }
  };

  const handleUrlUpdate = async (id: string, newUrl: string) => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url: trimmed } : item)),
    );

    try {
      await updateSocial.mutateAsync({
        id,
        url: trimmed,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSocial.mutateAsync(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlatforms = useMemo(() => {
    if (!searchPlatform.trim()) return PLATFORMS;
    return PLATFORMS.filter((p) =>
      p.name.toLowerCase().includes(searchPlatform.toLowerCase()),
    );
  }, [searchPlatform]);

  return (
    <div className="border-border bg-background rounded-2xl border p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              Social Media Links
            </h3>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {items.length} active
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Add your social icons and drag them into your preferred display
            order.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus size={15} /> Add Social Icon
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="border-border/60 bg-muted/20 mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <Sparkles size={20} className="text-primary" />
          </div>
          <h4 className="text-foreground mt-3 text-sm font-semibold">
            No social media icons yet
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            Connect your Instagram, Twitter/X, YouTube, GitHub, or LinkedIn so
            visitors can easily find you.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="border-border bg-background hover:bg-muted text-foreground mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium shadow-sm transition-colors"
          >
            <Plus size={14} /> Add your first social profile
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <DragDropProvider onDragEnd={handleDragEnd}>
            <ul className="space-y-2.5">
              {items.map((item, idx) => (
                <DraggableSocialRow
                  key={item.id}
                  social={{ ...item, position: idx }}
                  onToggleActive={handleToggleActive}
                  onUrlUpdate={handleUrlUpdate}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              ))}
            </ul>
          </DragDropProvider>
        </div>
      )}

      {isAddModalOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
          <div className="border-border bg-background animate-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl duration-200">
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-foreground text-base font-bold">
                  Add Social Media Link
                </h3>
                <p className="text-muted-foreground text-xs">
                  Choose a platform and enter your handle or link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 text-sm font-bold flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSocial} className="space-y-5 p-6">

              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  Select Platform
                </label>
                <div className="relative mb-2">
                  <Search
                    size={14}
                    className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    placeholder="Search platforms..."
                    value={searchPlatform}
                    onChange={(e) => setSearchPlatform(e.target.value)}
                    className="border-border bg-muted/40 text-foreground focus:ring-primary h-8 w-full rounded-lg border py-1 pr-3 pl-8 text-xs focus:ring-1 focus:outline-none"
                  />
                </div>

                <div className="custom-scrollbar grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {filteredPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`flex items-center gap-2.5 rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary ring-primary font-bold shadow-xs ring-1"
                            : "border-border hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${platform.color}`}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="truncate">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-xs font-semibold">
                  {getPlatformConfig(selectedPlatform).name} URL / Username
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={getPlatformConfig(selectedPlatform).placeholder}
                  autoFocus
                  required
                  className="border-border bg-background text-foreground focus:ring-primary h-10 w-full rounded-xl border px-3 py-2 text-sm shadow-xs transition-all focus:ring-1 focus:outline-none"
                />
                <p className="text-muted-foreground text-[11px]">
                  You can type your handle (e.g. <code>@username</code>) or full
                  URL.
                </p>
              </div>

              <div className="border-border flex items-center justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-border text-foreground hover:bg-muted rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSocial.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {createSocial.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  Add Social Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DraggableSocialRow({
  social,
  onToggleActive,
  onUrlUpdate,
  onDelete,
  isDeleting,
}: {
  social: SocialLink;
  onToggleActive: (s: SocialLink) => void;
  onUrlUpdate: (id: string, newUrl: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: social.id,
    index: social.position,
  });

  const platform = getPlatformConfig(social.platform);
  const Icon = platform.icon;

  const [localUrl, setLocalUrl] = useState(social.url);

  useEffect(() => {
    setLocalUrl(social.url);
  }, [social.url]);

  const handleBlur = () => {
    if (localUrl !== social.url) {
      onUrlUpdate(social.id, localUrl);
    }
  };

  return (
    <li
      ref={ref}
      className={`group list-none transition-all duration-150 select-none ${
        isDragging
          ? "ring-primary relative z-50 scale-[1.01] opacity-90 shadow-xl ring-2"
          : ""
      }`}
    >
      <div
        className={`border-border bg-background flex items-center justify-between gap-3 rounded-xl border p-3 shadow-xs transition-all hover:border-zinc-300 dark:hover:border-white/20 ${
          !social.isActive ? "opacity-60 grayscale-[30%]" : ""
        }`}
      >

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            ref={handleRef}
            type="button"
            className="text-muted-foreground hover:text-foreground flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg transition-colors active:cursor-grabbing"
            style={{ touchAction: "none" }}
            title="Drag to reorder social icon"
          >
            <GripVertical size={16} />
          </button>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${platform.color}`}
          >
            <Icon size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-foreground text-xs font-bold tracking-tight">
                {platform.name}
              </span>
              {social.counts > 0 && (
                <span className="bg-primary/10 text-primary py-0.2 rounded-full px-1.5 text-[10px] font-semibold">
                  {social.counts} clicks
                </span>
              )}
            </div>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              onBlur={handleBlur}
              className="text-muted-foreground focus:text-foreground hover:bg-muted/40 focus:border-border focus:bg-background focus:ring-primary mt-0.5 -ml-1 w-full rounded border border-transparent bg-transparent px-1 text-xs transition-all outline-none focus:ring-1"
              placeholder={platform.placeholder}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={
              social.url.startsWith("mailto:")
                ? social.url
                : social.url.startsWith("http")
                  ? social.url
                  : `https://${social.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            title="Open destination"
          >
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={() => onToggleActive(social)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              social.isActive ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"
            }`}
            title={
              social.isActive ? "Visible on profile" : "Hidden from profile"
            }
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                social.isActive ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => onDelete(social.id)}
            disabled={isDeleting}
            className="text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
            title="Delete social link"
          >
            {isDeleting ? (
              <Loader2 size={13} className="animate-spin text-red-500" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
