"use client";

import {
  Link as LinkIcon,
  MousePointerClick,
  Eye,
  Activity,
  ArrowUpRight,
  User,
  Share2,
  Loader2,
  ExternalLink,
  Trash2,
  Copy,
  Globe,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Link as LinkType } from "@vyrex/types";
import { getLinks } from "@/apis/get-links";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getPublicProfile } from "@/apis/get-public-profile";
import { getMe } from "@/apis/get-user-profile";

export default function UserDashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: session } = authClient.useSession();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const linksData = await getLinks();

        setLinks(linksData || []);
      } catch (err) {
        console.error("❌ Failed to fetch links:", err);
        setError("Failed to load links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const copyToClipboard = async (link: LinkType) => {
    if (!link.public) {
      toast.warning("This link is private. Make it public to share.");
      return;
    }

    // You'll need to update this with your actual domain and username
    const shareUrl = `${window.location.origin}/public/${link.userId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy link.");
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const username = await getMe(session?.user?.id || "");

        if (!username) {
          // User doesn't have a username (likely from social signin)
          setError("Please set up your username to view your public profile");
          setLoading(false);
          // Redirect to settings/profile page to complete username setup

          setTimeout(() => {
            router.push("/dashboard/settings");
          }, 2000);

          return;
        }

        // Fetch public profile using the public API
        const data = await getPublicProfile(username.data.userName);

        setUsername(data.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user, router]);

  // const togglePublic = async (linkId: string, isPublic: boolean) => {
  //   try {
  //     const res = await fetch(`/api/v1/links/${linkId}`, {
  //       method: "PATCH",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ public: !isPublic }),
  //     });

  //     if (!res.ok) throw new Error("Failed to update link");

  //     // Update local state
  //     setLinks(
  //       links.map((link) =>
  //         link.id === linkId ? { ...link, public: !isPublic } : link,
  //       ),
  //     );
  //   } catch (err) {
  //     console.error("Failed to toggle public:", err);
  //     toast.error("Failed to update link visibility");
  //   }
  // };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen font-sans">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight">
                Overview
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Here&apos;s what&apos;s happening with your profile today.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-background rounded-xl border p-5">
              <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                <Eye size={12} /> Total Views
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">0</h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <ArrowUpRight size={12} className="text-green-500" /> 0% from
                last week
              </p>
            </div>
            <div className="border-border bg-background rounded-xl border p-5">
              <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                <MousePointerClick size={12} /> Total Clicks
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">0</h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <ArrowUpRight size={12} className="text-green-500" /> 0% from
                last week
              </p>
            </div>
            <div className="border-border bg-background rounded-xl border p-5">
              <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                <Activity size={12} /> CTR
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">0%</h3>
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <ArrowUpRight size={12} className="text-green-500" /> 0% from
                last week
              </p>
            </div>
            <div className="border-border bg-background rounded-xl border p-5">
              <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                <LinkIcon size={12} /> Active Links
              </p>
              <h3 className="text-2xl font-semibold tracking-tight">
                {links.length}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {links.length === 0 ? "Ready to be added" : "In your profile"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-sm md:p-16">
              <Loader2 className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-sm md:p-16">
              <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <LinkIcon size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-foreground mb-1.5 text-base font-medium">
                You haven&apos;t added any links yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                Start building your personal page by adding your first link. You
                can link to your social media, portfolio, or products.
              </p>
              <button
                className="bg-primary text-primary-foreground inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
                onClick={() => router.push("/dashboard/links")}
              >
                Create your first link
              </button>
            </div>
          ) : (
            <div className="border-border bg-background rounded-xl border p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground text-sm font-medium">
                  Your Links ({links.length})
                </h3>
                <button
                  className="bg-primary text-primary-foreground inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
                  onClick={() => router.push("/dashboard/links")}
                >
                  <LinkIcon size={14} className="mr-2" /> Add Link
                </button>
              </div>

              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="border-border bg-muted/50 hover:bg-muted flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-12">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-foreground text-md truncate font-medium">
                          {link.title}
                        </h4>
                        <p className="text-muted-foreground truncate text-xs">
                          {link.url}
                        </p>
                      </div>
                      <div className="text-muted-foreground mt-2 hidden flex-wrap items-center gap-3 text-xs md:flex">
                        <button
                          // onClick={() => togglePublic(link.id, link.public)}
                          className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                            link.public
                              ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-600 hover:bg-gray-500/30"
                          }`}
                          title={
                            link.public
                              ? "Click to make private"
                              : "Click to make public"
                          }
                        >
                          {link.public ? (
                            <>
                              <Globe size={12} /> Public
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Private
                            </>
                          )}
                        </button>
                        {link.isActive ? (
                          <span className="text-green-600">✓ Active</span>
                        ) : (
                          <span className="text-gray-600">○ Inactive</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {link.public && (
                        <button
                          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium transition-colors ${
                            copiedId === link.id
                              ? "bg-green-500/20 text-green-600"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                          onClick={() => copyToClipboard(link)}
                          title="Copy share link"
                        >
                          <Copy size={14} />
                          {copiedId === link.id ? "Copied!" : "Share"}
                        </button>
                      )}
                      <button
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        onClick={() => window.open(link.url, "_blank")}
                        title="Open link"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        onClick={() =>
                          router.push(`/dashboard/links?edit=${link.id}`)
                        }
                        title="Edit link"
                      >
                        <LinkIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-border bg-background rounded-xl border p-6 sm:p-8">
            <h3 className="text-foreground mb-6 text-sm font-medium">
              Quick setup guide
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="flex flex-col gap-2">
                <div className="bg-muted text-foreground mb-1 flex h-8 w-8 items-center justify-center rounded-lg">
                  <User size={16} />
                </div>
                <h4 className="text-foreground text-sm font-medium">
                  1. Setup Profile
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Add your photo, name, and a short bio so your audience knows
                  it&apos;s you.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-muted text-foreground mb-1 flex h-8 w-8 items-center justify-center rounded-lg">
                  <LinkIcon size={16} />
                </div>
                <h4 className="text-foreground text-sm font-medium">
                  2. Add Links
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Consolidate all your important URLs into one clean, manageable
                  list.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="bg-muted text-foreground mb-1 flex h-8 w-8 items-center justify-center rounded-lg">
                  <Share2 size={16} />
                </div>
                <h4 className="text-foreground text-sm font-medium">
                  3. Share Page
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Copy your unique Vyrex URL and paste it into your social bios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
