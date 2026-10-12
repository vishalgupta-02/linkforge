"use client";

import React, { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  Plus,
  Search,
  Bell,
  Home,
  QrCode,
  FolderPlus,
  Folder,
  Trash2,
  Calendar,
  Lock,
  Crown,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { QrCodeModal } from "@/components/custom/qr-code-modal";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import DraggableLinks, { type LinkItem } from "@/app/(dashboard)/(components)/draggable-links";
import DashboardLayout from "../../(components)/dashboard-layout";
import { toast } from "sonner";
import { createLinks } from "@/apis/create-links";
import { getLinks } from "@/apis/get-links";
import { deleteLink } from "@/apis/delete-link";
import {
  updateLink,
  reorderLinksApi,
  getSectionsApi,
  createSectionApi,
  deleteSectionApi,
  updateSectionApi,
  type SectionItem,
} from "@/apis/update-link";
import type { DragEndEvent } from "@dnd-kit/react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getPublicProfile } from "@/apis/get-public-profile";
import { getMe } from "@/apis/get-user-profile";
import { useUserProfile } from "@/hooks/use-user-profile";
import { LinkEditDialog } from "@/components/custom/link-edit-dialog";
import type { Link } from "@vyrex/types";

export default function CreatorLinkManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: userProfile } = useUserProfile();

  const plan = userProfile?.data?.plan || null;
  const isPro = Boolean(
    plan && (plan.toUpperCase() === "PRO" || plan.toUpperCase() === "BUSINESS"),
  );

  const [username, setUsername] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteSectionConfirmId, setDeleteSectionConfirmId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [qrCodeTarget, setQrCodeTarget] = useState<{
    url: string;
    title?: string;
    subtitle?: string;
  } | null>(null);

  // Link Edit & Schedule Dialog State
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [showNewSectionModal, setShowNewSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedLinks, fetchedSections] = await Promise.all([
        getLinks(),
        getSectionsApi(),
      ]);

      if (Array.isArray(fetchedLinks)) {
        const sorted = [...fetchedLinks].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0),
        );
        setLinks(sorted);
      } else {
        setLinks([]);
      }

      setSections(fetchedSections || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load links & sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMe(session?.user?.id || "");
        if (res?.data?.userName) {
          const profile = await getPublicProfile(res.data.userName);
          setUsername(profile.data);
        }
      } catch (err) {
        console.error("Failed to fetch public profile info:", err);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user]);

  const handleAddLink = (targetSectionId?: string | null) => {
    const newLink: LinkItem = {
      id: `temp-${Date.now()}`,
      title: "",
      url: "",
      position: links.length,
      counts: 0,
      public: true,
      isActive: true,
      deletedAt: null,
      userId: "",
      sectionId: targetSectionId || null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    };

    setLinks((prev) => [...prev, newLink]);
  };

  const handleCreateSectionHeader = async () => {
    if (!isPro) {
      toast.error(
        "Section headers and grouping require a Pro subscription. Upgrade to organize your links into sections.",
      );
      router.push("/pricing");
      return;
    }

    if (!newSectionTitle.trim()) {
      toast.error("Please enter a section title");
      return;
    }

    try {
      setIsCreatingSection(true);
      const created = await createSectionApi(newSectionTitle.trim(), sections.length);
      setSections((prev) => [...prev, created]);
      setNewSectionTitle("");
      setShowNewSectionModal(false);
      toast.success(`Section "${created.title}" created`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create section");
    } finally {
      setIsCreatingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSectionApi(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      // Reset sectionId on local links
      setLinks((prev) =>
        prev.map((l) => (l.sectionId === sectionId ? { ...l, sectionId: null, section: null } : l)),
      );
      toast.success("Section removed");
      setDeleteSectionConfirmId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete section");
    }
  };

  const handleUpdateLink = (linkId: string, updates: Partial<LinkItem>) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, ...updates } : l)),
    );
  };

  const handleAutoSaveLink = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (!link || !link.title || !link.url || linkId.startsWith("temp-")) return;

    try {
      await updateLink({
        id: linkId,
        title: link.title,
        url: link.url,
        public: link.public,
        isActive: link.isActive,
        sectionId: link.sectionId,
        scheduledStart: link.scheduledStart,
        scheduledEnd: link.scheduledEnd,
      });
    } catch (error) {
      console.error("Failed to auto-save link:", error);
    }
  };

  const handleSaveLink = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (!link) return;

    if (!link.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!link.url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setSavingId(linkId);

      if (link.isNew || link.id.startsWith("temp-")) {
        const created = await createLinks({
          title: link.title,
          url: link.url,
          public: link.public,
          isActive: link.isActive,
        });

        if (created?.data?.id) {
          setLinks((prev) =>
            prev.map((l) =>
              l.id === linkId ? { ...created.data, isNew: false } : l,
            ),
          );
        }
        toast.success("Link created successfully");
      } else {
        await updateLink({
          id: link.id,
          title: link.title,
          url: link.url,
          public: link.public,
          isActive: link.isActive,
          sectionId: link.sectionId,
          scheduledStart: link.scheduledStart,
          scheduledEnd: link.scheduledEnd,
        });
        toast.success("Link updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save link");
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveLinkDetails = async (linkId: string, updates: Partial<Link>) => {
    try {
      setSavingId(linkId);
      await updateLink({
        id: linkId,
        title: updates.title,
        url: updates.url,
        sectionId: updates.sectionId,
        scheduledStart: updates.scheduledStart,
        scheduledEnd: updates.scheduledEnd,
      });

      // Find matching section object if assigned
      const assignedSection = sections.find((s) => s.id === updates.sectionId) || null;

      setLinks((prev) =>
        prev.map((l) =>
          l.id === linkId
            ? {
                ...l,
                ...updates,
                section: assignedSection as any,
              }
            : l,
        ),
      );
      toast.success("Link details & schedule updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update link details");
      throw err;
    } finally {
      setSavingId(null);
    }
  };

  const handleDuplicateLink = (linkId: string) => {
    const linkToDuplicate = links.find((l) => l.id === linkId);
    if (!linkToDuplicate) return;

    const newLink: LinkItem = {
      ...linkToDuplicate,
      id: `temp-${Date.now()}`,
      title: `${linkToDuplicate.title} (Copy)`,
      position: links.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    };

    setLinks((prev) => [...prev, newLink]);
    toast.success("Link duplicated (click Save to persist)");
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      if (deleteConfirmId.startsWith("temp-")) {
        setLinks((prev) => prev.filter((l) => l.id !== deleteConfirmId));
        toast.success("Link deleted");
        setDeleteConfirmId(null);
        return;
      }

      await deleteLink(deleteConfirmId);
      setLinks((prev) => prev.filter((l) => l.id !== deleteConfirmId));
      toast.success("Link deleted");
    } catch (error) {
      toast.error("Failed to delete link");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (event.canceled) return;

    const moved = move(links, event);
    if (!Array.isArray(moved)) return;

    const updatedLinks: LinkItem[] = moved.map((item, idx) => ({
      ...item,
      position: idx,
    }));

    setLinks(updatedLinks);

    const persistedLinkIds = updatedLinks
      .filter((l) => !l.isNew && !l.id.startsWith("temp-"))
      .map((l) => l.id);

    if (persistedLinkIds.length > 0) {
      try {
        await reorderLinksApi(persistedLinkIds);
      } catch (error) {
        console.error("Failed to reorder links via batch API:", error);
      }
    }
  };

  if (!mounted) return null;

  // Group links by section for organized management view
  const sectionGroups = sections.map((sec) => ({
    section: sec,
    links: links.filter((l) => l.sectionId === sec.id),
  }));

  const ungroupedLinks = links.filter(
    (l) => !l.sectionId || !sections.some((s) => s.id === l.sectionId),
  );

  return (
    <DashboardLayout>
      <div className="flex h-full w-full flex-col bg-zinc-50 font-sans text-zinc-950 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <header className="z-10 flex h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-white/5 dark:bg-[#111]">
          <div className="relative max-w-5xl flex-1">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search links & sections..."
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-4 pl-9 text-sm shadow-xs transition-colors placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-hidden dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs font-semibold text-zinc-600 shadow-xs transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
              title="Return to Home"
            >
              <Home size={13} />
              <span>Home</span>
            </a>
            <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-500 shadow-xs transition-colors hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5">
              <Bell size={14} />
            </button>
          </div>
        </header>

        <main className="custom-scrollbar w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-8 px-8 py-10 lg:px-12">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Your Links & Sections
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Organize your profile with drag-and-drop section headers and automated link scheduling.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() =>
                    setQrCodeTarget({
                      url:
                        typeof window !== "undefined" && (username as any)?.userName
                          ? `${window.location.origin}/username/${(username as any).userName}`
                          : typeof window !== "undefined"
                            ? `${window.location.origin}/public-profile`
                            : "/public-profile",
                      title: `${(username as any)?.name || (username as any)?.userName || "Your"} Profile QR Code`,
                      subtitle: "Instant vector SVG and high-resolution PNG download.",
                    })
                  }
                  className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
                >
                  <QrCode size={15} className="text-primary" /> QR Code
                </button>

                <button
                  onClick={() => {
                    if (!isPro) {
                      toast.error("Custom Section Headers require a Pro plan");
                      router.push("/pricing");
                      return;
                    }
                    setShowNewSectionModal(true);
                  }}
                  className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-semibold shadow-xs transition-all active:scale-[0.98]"
                >
                  <FolderPlus size={15} className="text-violet-500" />
                  + Add Section
                  {!isPro && (
                    <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[10px] font-bold text-violet-600">
                      Pro
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleAddLink(null)}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  <Plus size={16} /> Add link
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-violet-500 dark:border-zinc-700 dark:border-t-violet-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Loading your links & sections...
                </p>
              </div>
            )}

            {!loading && links.length === 0 && sections.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-white/1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-white/5">
                  <LinkIcon size={20} />
                </div>
                <h3 className="mb-1 text-base font-bold text-zinc-900 dark:text-white">
                  No links yet
                </h3>
                <p className="mb-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Start building your page by adding links and section headers.
                </p>
                <button
                  onClick={() => handleAddLink(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold shadow-xs transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Add your first link
                </button>
              </div>
            )}

            {/* Draggable Links & Sections Management */}
            {!loading && (links.length > 0 || sections.length > 0) && (
              <div className="space-y-8">
                {/* Sections with Grouped Links */}
                {sectionGroups.map((group) => (
                  <div
                    key={group.section.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 shadow-xs dark:border-white/5 dark:bg-white/2"
                  >
                    {/* Section Header Banner */}
                    <div className="mb-4 flex items-center justify-between border-b border-zinc-200/60 pb-3 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                          <Folder size={15} />
                        </div>
                        <h2 className="text-sm font-bold tracking-tight text-foreground">
                          {group.section.title}
                        </h2>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {group.links.length} {group.links.length === 1 ? "link" : "links"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddLink(group.section.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                          title="Add link to this section"
                        >
                          <Plus size={13} /> Add Link
                        </button>
                        <button
                          onClick={() => setDeleteSectionConfirmId(group.section.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          title="Delete section header"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Links belonging to this section */}
                    {group.links.length === 0 ? (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No links in this section yet. Click "+ Add Link" to add one, or edit an existing link to assign it here.
                      </p>
                    ) : (
                      <DragDropProvider onDragEnd={handleDragEnd}>
                        <ul className="space-y-3">
                          {group.links.map((link, idx) => (
                            <DraggableLinks
                              key={link.id}
                              id={link.id}
                              username={username}
                              index={{ ...link, position: idx }}
                              onUpdate={handleUpdateLink}
                              onDuplicate={handleDuplicateLink}
                              onSave={handleSaveLink}
                              onAutoSave={handleAutoSaveLink}
                              savingId={savingId}
                              setDeleteConfirmId={setDeleteConfirmId}
                              onOpenEdit={(l) => setEditingLink(l)}
                            />
                          ))}
                        </ul>
                      </DragDropProvider>
                    )}
                  </div>
                ))}

                {/* Ungrouped / General Links Section */}
                {ungroupedLinks.length > 0 && (
                  <div className="space-y-3">
                    {sections.length > 0 && (
                      <div className="flex items-center justify-between px-2 pt-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          General / Ungrouped Links
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {ungroupedLinks.length} links
                        </span>
                      </div>
                    )}
                    <DragDropProvider onDragEnd={handleDragEnd}>
                      <ul className="space-y-3">
                        {ungroupedLinks.map((link, idx) => (
                          <DraggableLinks
                            key={link.id}
                            id={link.id}
                            username={username}
                            index={{ ...link, position: idx }}
                            onUpdate={handleUpdateLink}
                            onDuplicate={handleDuplicateLink}
                            onSave={handleSaveLink}
                            onAutoSave={handleAutoSaveLink}
                            savingId={savingId}
                            setDeleteConfirmId={setDeleteConfirmId}
                            onOpenEdit={(l) => setEditingLink(l)}
                          />
                        ))}
                      </ul>
                    </DragDropProvider>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Link Confirmation Modal */}
      {deleteConfirmId && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 p-4 backdrop-blur-xs duration-200 dark:bg-black/40">
          <div className="animate-in zoom-in-95 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl duration-200 dark:border-white/10 dark:bg-[#111]">
            <div className="p-6 text-center">
              <h3 className="mb-2 text-lg font-bold text-zinc-950 dark:text-white">
                Delete this link?
              </h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                This action cannot be undone. It will be removed from your profile immediately.
              </p>
            </div>
            <div className="flex gap-2 border-t border-zinc-100 bg-zinc-50 p-4 dark:border-white/5 dark:bg-[#0a0a0a]">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-xs transition-all hover:bg-red-700 active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {deleteSectionConfirmId && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 p-4 backdrop-blur-xs duration-200 dark:bg-black/40">
          <div className="animate-in zoom-in-95 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl duration-200 dark:border-white/10 dark:bg-[#111]">
            <h3 className="mb-2 text-lg font-bold text-zinc-950 dark:text-white">
              Delete Section Header?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This will remove the section header. Links currently under this section will be moved to ungrouped links without being deleted.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteSectionConfirmId(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSection(deleteSectionConfirmId)}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Section Modal */}
      {showNewSectionModal && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">
              Add Section Header
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Create a group header to organize your links (e.g. "Featured Projects", "Socials", "My Store").
            </p>

            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Section Title"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                autoFocus
                className="border-input bg-background text-foreground w-full rounded-xl border px-3.5 py-2 text-sm focus:border-violet-500 focus:outline-hidden"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewSectionModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  disabled={isCreatingSection || !newSectionTitle.trim()}
                  onClick={handleCreateSectionHeader}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {isCreatingSection ? "Creating..." : "Create Section"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Edit & Scheduling Dialog with Date/Time Pickers */}
      <LinkEditDialog
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        link={editingLink}
        sections={sections}
        isPro={isPro}
        onSave={handleSaveLinkDetails}
        onCreateSection={async (title: string) => {
          const created = await createSectionApi(title, sections.length);
          setSections((prev) => [...prev, created]);
          return created;
        }}
      />

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={Boolean(qrCodeTarget)}
        onClose={() => setQrCodeTarget(null)}
        url={qrCodeTarget?.url || ""}
        title={qrCodeTarget?.title || "QR Code"}
        subtitle={qrCodeTarget?.subtitle || "Instant vector SVG and PNG download."}
      />
    </DashboardLayout>
  );
}
