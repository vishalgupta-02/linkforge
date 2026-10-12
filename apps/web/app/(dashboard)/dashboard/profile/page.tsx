"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Link as LinkIcon,
  Palette,
  BarChart3,
  Shield,
  Camera,
  BadgeCheck,
  Plus,
  Loader2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  QrCode,
  Crown,
  Check,
} from "lucide-react";
import DashboardLayout from "@/app/(dashboard)/(components)/dashboard-layout";
import { useUserProfile, userProfileKeys } from "@/hooks/use-user-profile";
import { useLinks, linksKeys } from "@/hooks/use-links";
import { authClient } from "@/lib/auth-client";
import {
  updateUserProfile,
  changeUsernameApi,
  uploadAvatarImage,
} from "@/apis/update-profile";
import { updateLink } from "@/apis/update-link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SocialMediaManager } from "@/components/custom/social-media-manager";
import { THEME_LIST, ThemeKey } from "@/lib/themes";
import { QrCodeModal } from "@/components/custom/qr-code-modal";

export default function CreatorDashboardProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<
    "general" | "links" | "appearance"
  >("general");

  const { data: session } = authClient.useSession();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: linksData, isLoading: linksLoading } = useLinks();

  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>("default");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [togglingLinkId, setTogglingLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.data) {
      setName(userProfile.data.name || session?.user?.name || "");
      setUserName(userProfile.data.userName || "");
      setBio(userProfile.data.bio || "");
      setAvatarUrl(userProfile.data.image || session?.user?.image || null);
      if (userProfile.data.theme) {
        setSelectedTheme(userProfile.data.theme);
      }
    } else if (session?.user) {
      setName(session.user.name || "");
      setAvatarUrl(session.user.image || null);
    }
  }, [userProfile, session]);

  const links = linksData || [];
  const isPro =
    userProfile?.data?.plan === "PRO" ||
    userProfile?.data?.plan === "BUSINESS";

  const handleSelectTheme = async (themeKey: string, isThemePro: boolean) => {
    if (isThemePro && !isPro) {
      toast.error(
        "This designer theme requires a Pro or Business subscription. Upgrade to unlock all bespoke themes.",
      );
      return;
    }

    try {
      setIsApplyingTheme(true);
      setSelectedTheme(themeKey);
      await updateUserProfile({ theme: themeKey });
      await queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      toast.success("Theme applied successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update theme");
    } finally {
      setIsApplyingTheme(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadAvatarImage(file);
      setAvatarUrl(uploaded.url);

      await updateUserProfile({ image: uploaded.url });
      await queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      toast.success("Profile photo updated successfully!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast.error(err.message || "Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setIsSaving(true);

      const trimmedName = name.trim();
      const trimmedBio = bio.trim();
      const trimmedUserName = userName.trim().toLowerCase();

      await updateUserProfile({
        name: trimmedName,
        bio: trimmedBio,
        ...(avatarUrl ? { image: avatarUrl } : {}),
      });

      if (
        trimmedUserName &&
        trimmedUserName !== userProfile?.data?.userName?.toLowerCase()
      ) {
        await changeUsernameApi(trimmedUserName);
      }

      await queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      toast.success("Profile changes saved successfully!");
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to save profile changes",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLink = async (linkId: string, currentPublic: boolean) => {
    try {
      setTogglingLinkId(linkId);
      await updateLink({ id: linkId, public: !currentPublic });
      await queryClient.invalidateQueries({ queryKey: linksKeys.all });
      toast.success(
        !currentPublic ? "Link is now public" : "Link is now private",
      );
    } catch (err) {
      toast.error("Failed to update link visibility");
    } finally {
      setTogglingLinkId(null);
    }
  };

  const copyPublicUrl = async () => {
    const activeUsername = userName || userProfile?.data?.userName;
    const url = activeUsername
      ? `${window.location.origin}/username/${activeUsername}`
      : `${window.location.origin}/public-profile`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public profile URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-background text-foreground selection:bg-primary/30 flex h-full w-full flex-col font-sans">
        <main className="custom-scrollbar w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-8 px-6 py-8 lg:px-10">
            <div>
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Profile Settings
              </h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                Manage your public identity, links, and appearance.
              </p>
            </div>

            <div className="border-border flex items-center gap-6 border-b">
              <TabButton
                icon={<User size={14} />}
                label="General"
                active={activeTab === "general"}
                onClick={() => setActiveTab("general")}
              />
              <TabButton
                icon={<LinkIcon size={14} />}
                label={`Links (${links.length})`}
                active={activeTab === "links"}
                onClick={() => setActiveTab("links")}
              />
              <TabButton
                icon={<Palette size={14} />}
                label="Appearance"
                active={activeTab === "appearance"}
                onClick={() => setActiveTab("appearance")}
              />
              <TabButton
                icon={<BarChart3 size={14} />}
                label="Analytics"
                active={false}
                onClick={() => router.push("/dashboard/analytics")}
              />
              <TabButton
                icon={<Shield size={14} />}
                label="Security & Billing"
                active={false}
                onClick={() => router.push("/dashboard/settings")}
              />
            </div>

            {profileLoading ? (
              <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-12 shadow-sm">
                <Loader2 className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Loading profile...
                </p>
              </div>
            ) : activeTab === "general" ? (
              <form
                onSubmit={handleSaveChanges}
                className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
              >
                <div className="border-border bg-background flex flex-col items-start gap-6 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative shrink-0 cursor-pointer"
                    title="Click to upload profile photo"
                  >
                    <div className="border-border bg-muted relative h-24 w-24 overflow-hidden rounded-full border shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          <User size={36} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                        {isUploading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Camera size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />

                  <div className="w-full flex-1">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="mb-1 flex items-center gap-1.5">
                          <h2 className="text-foreground text-lg font-bold">
                            {name || userName || "Your Profile"}
                          </h2>
                          {isPro && (
                            <BadgeCheck
                              size={16}
                              className="text-primary shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">
                          {userName
                            ? `${window.location.host}/username/${userName}`
                            : "No username set yet"}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {session?.user?.email || "No email"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-all disabled:opacity-50"
                        >
                          {isUploading ? (
                            <Loader2 size={14} className="mr-2 animate-spin" />
                          ) : (
                            <Camera size={14} className="mr-2" />
                          )}
                          Upload photo
                        </button>
                        <button
                          type="button"
                          onClick={copyPublicUrl}
                          className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors"
                        >
                          <Copy size={14} className="mr-2" /> Copy URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsQrModalOpen(true)}
                          className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors"
                        >
                          <QrCode size={14} className="mr-2" /> QR Code
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              userName
                                ? `/username/${userName}`
                                : "/public-profile",
                              "_blank",
                            )
                          }
                          className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors"
                          title="View live public profile"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-border bg-background flex flex-col overflow-hidden rounded-2xl border shadow-sm">
                  <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:p-8">
                    <div className="space-y-2">
                      <label className="text-foreground text-sm font-semibold">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full or brand name"
                        className="border-border bg-background text-foreground focus:ring-primary h-10 w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-foreground text-sm font-semibold">
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <span className="text-muted-foreground pointer-events-none absolute left-3 text-sm font-medium">
                          @
                        </span>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) =>
                            setUserName(
                              e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                            )
                          }
                          placeholder="username"
                          className="border-border bg-background text-foreground focus:ring-primary h-10 w-full rounded-xl border py-2 pr-3 pl-8 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-foreground text-sm font-semibold">
                          Bio
                        </label>
                        <span className="text-muted-foreground text-xs">
                          {bio.length} / 160
                        </span>
                      </div>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 160))}
                        placeholder="Write a short bio for your public profile..."
                        className="border-border bg-background text-foreground focus:ring-primary min-h-24 w-full resize-none rounded-xl border p-3 text-sm shadow-sm transition-all focus:ring-1 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-foreground text-sm font-semibold">
                        Account Email
                      </label>
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="border-border bg-muted text-muted-foreground h-10 w-full cursor-not-allowed rounded-xl border px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="border-border bg-muted/40 flex items-center justify-end gap-3 border-t px-6 py-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-6 text-sm font-medium shadow-sm transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 size={14} className="mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} className="mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <SocialMediaManager />
                </div>
              </form>
            ) : activeTab === "links" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-foreground text-lg font-bold">
                      Your Profile Links ({links.length})
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      Toggle visibility or navigate to the drag-and-drop link editor.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/links")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium shadow-sm transition-all"
                  >
                    <Plus size={16} /> Open Full Link Manager
                  </button>
                </div>

                {linksLoading ? (
                  <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-sm">
                    <Loader2 className="text-muted-foreground mb-4 h-8 w-8 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                      Loading your links...
                    </p>
                  </div>
                ) : links.length === 0 ? (
                  <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-sm">
                    <LinkIcon size={24} className="text-muted-foreground mb-3" />
                    <h3 className="text-foreground text-base font-medium">
                      No links added yet
                    </h3>
                    <p className="text-muted-foreground mt-1 mb-4 text-xs">
                      Add links to share with your audience.
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/links")}
                      className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium"
                    >
                      Add your first link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="border-border bg-background flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-foreground truncate text-sm font-semibold">
                            {link.title}
                          </h4>
                          <p className="text-muted-foreground truncate text-xs">
                            {link.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleToggleLink(link.id, link.public)
                            }
                            disabled={togglingLinkId === link.id}
                            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                              link.public
                                ? "bg-emerald-500/20 text-emerald-600"
                                : "bg-zinc-500/20 text-zinc-500"
                            }`}
                          >
                            {togglingLinkId === link.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : link.public ? (
                              <>
                                <Globe size={12} /> Public
                              </>
                            ) : (
                              <>
                                <Lock size={12} /> Private
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/links?edit=${link.id}`)
                            }
                            className="text-muted-foreground hover:text-foreground p-1 text-xs font-medium underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
                {/* Live Preview & QR Code Quick Actions */}
                <div className="border-border bg-background rounded-2xl border p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-foreground text-base font-semibold">
                        Public Page Appearance & Distribution
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Preview your public page or generate print-ready vector QR codes.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="border-border bg-card hover:bg-accent text-foreground inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold shadow-sm transition-all"
                      >
                        <QrCode size={14} className="text-primary" /> Get QR Code
                      </button>

                      <button
                        onClick={() =>
                          window.open(
                            userName
                              ? `/username/${userName}`
                              : "/public-profile",
                            "_blank",
                          )
                        }
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-sm transition-all"
                      >
                        <ExternalLink size={14} /> View Live Page
                      </button>
                    </div>
                  </div>
                </div>

                {/* Theme Studio */}
                <div className="border-border bg-background rounded-2xl border p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <Palette size={18} className="text-primary" />
                        <h3 className="text-foreground text-base font-semibold">
                          Designer Theme Studio
                        </h3>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Select a bespoke visual palette. Themes apply instantly to your public profile and link cards.
                      </p>
                    </div>

                    {!isPro && (
                      <div className="border-border bg-muted/40 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-amber-500">
                        <Crown size={13} />
                        <span>Upgrade to Pro for all 8 themes</span>
                      </div>
                    )}
                  </div>

                  {/* Themes Grid */}
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {THEME_LIST.map((theme) => {
                      const isCurrent = selectedTheme === theme.key;
                      const isLocked = theme.isPro && !isPro;

                      return (
                        <div
                          key={theme.key}
                          onClick={() => handleSelectTheme(theme.key, theme.isPro)}
                          className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                            isCurrent
                              ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]"
                              : "border-border hover:border-border/80 hover:shadow-sm"
                          } ${isLocked ? "opacity-75 hover:opacity-100" : ""}`}
                        >
                          {/* Mini Mockup Window */}
                          <div
                            className="relative mb-3 flex h-32 w-full flex-col items-center justify-center rounded-xl p-3 shadow-inner"
                            style={{ backgroundColor: theme.bgHex }}
                          >
                            {/* Mock Avatar */}
                            <div
                              className="mb-2 h-7 w-7 rounded-full border border-black/10 shadow-sm"
                              style={{ backgroundColor: theme.accentHex }}
                            />
                            {/* Mock Link Button 1 */}
                            <div
                              className="mb-1.5 flex h-6 w-full max-w-[130px] items-center justify-center rounded-lg text-[9px] font-bold shadow-sm"
                              style={{
                                backgroundColor: theme.cardHex,
                                color: theme.textColor,
                              }}
                            >
                              My Portfolio
                            </div>
                            {/* Mock Link Button 2 */}
                            <div
                              className="flex h-5 w-full max-w-[110px] items-center justify-center rounded-md opacity-80 text-[8px] font-medium"
                              style={{
                                backgroundColor: theme.cardHex,
                                color: theme.textColor,
                              }}
                            >
                              Latest Video
                            </div>
                          </div>

                          {/* Theme Info */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-foreground text-sm font-semibold">
                                  {theme.name}
                                </span>
                                {theme.isPro && (
                                  <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                    Pro
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-0.5 text-[11px] leading-tight line-clamp-1">
                                {theme.tagline}
                              </p>
                            </div>

                            {/* Active or Locked Badge */}
                            <div>
                              {isCurrent ? (
                                <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full shadow-sm">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              ) : isLocked ? (
                                <div className="text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full">
                                  <Lock size={12} />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Profile QR Code Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/username/${userName || ""}`
            : `/username/${userName}`
        }
        title={`${name || userName || "Creator"}'s QR Code`}
        subtitle="Download as crisp vector SVG for print or high-res PNG for digital media."
      />
    </DashboardLayout>
  );
}

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
    type="button"
    onClick={onClick}
    className={`relative flex cursor-pointer items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
      active
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {icon} {label}
    {active && (
      <span className="bg-primary absolute right-0 -bottom-px left-0 h-0.5 rounded-t-full" />
    )}
  </button>
);
