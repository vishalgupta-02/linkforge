"use client";

import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Plus, Search, Bell } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import DraggableLinks from "@/app/(dashboard)/(components)/draggable-links";
import DashboardLayout from "../../(components)/dashboard-layout";
import { toast } from "sonner";
import { createLinks } from "@/apis/create-links";
import { getLinks, type Link } from "@/apis/get-links";
import { deleteLink } from "@/apis/delete-link";
import { updateLink } from "@/apis/update-link";
import type { DragEndEvent } from "@dnd-kit/react";
import { useRouter } from "next/router";
import { authClient } from "@/lib/auth-client";
import { getPublicProfile } from "@/apis/get-public-profile";
import { getMe } from "@/apis/get-user-profile";

// --- Types ---
interface LinkItem extends Link {
  featured?: boolean;
  isNew?: boolean;
}

export default function CreatorLinkManagement() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [links, setLinks] = useState<LinkItem[]>([]);

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // UI States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load links on mount
  useEffect(() => {
    const loadLinks = async () => {
      try {
        setLoading(true);
        const fetchedLinks = await getLinks();

        // Ensure fetchedLinks is an array
        if (Array.isArray(fetchedLinks)) {
          setLinks(fetchedLinks);
        } else {
          console.warn("Fetched links is not an array:", fetchedLinks);
          setLinks([]);
        }
      } catch (error) {
        console.error("Failed to load links:", error);
        toast.error("Failed to load links");
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  useEffect(() => {
    // avoid synchronous state update inside effect to prevent cascading renders
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- Actions ---
  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: `temp-${Date.now()}`,
      title: "",
      url: "",
      position: (Array.isArray(links) ? links : []).length,
      counts: 0,
      public: true,
      isActive: true,
      deletedAt: null,
      userId: "",
      sectionId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    };

    setLinks((prevLinks) => {
      const safeLinks = Array.isArray(prevLinks) ? prevLinks : [];
      return [...safeLinks, newLink];
    });
  };

  const handleUpdateLink = (linkId: string, updates: Partial<LinkItem>) => {
    const safeLinks = Array.isArray(links) ? links : [];
    const updatedLink = safeLinks.find((l) => l.id === linkId);
    if (!updatedLink) return;

    const newLink = { ...updatedLink, ...updates };
    setLinks(safeLinks.map((l) => (l.id === linkId ? newLink : l)));
  };

  const handleAutoSaveLink = async (linkId: string) => {
    const safeLinks = Array.isArray(links) ? links : [];
    const link = safeLinks.find((l) => l.id === linkId);
    if (!link) return;

    if (!link.title || !link.url) return;

    // Don't auto-save temp links (new duplicates)
    if (link.isNew && linkId.startsWith("temp-")) {
      return;
    }

    try {
      await updateLink({
        id: link.id,
        title: link.title,
        url: link.url,
        position: link.position,
        public: link.public,
        isActive: link.isActive,
      });
    } catch (error) {
      console.error("Failed to auto-save link:", error);
    }
  };

  const handleSaveLink = async (linkId: string) => {
    const safeLinks = Array.isArray(links) ? links : [];
    const link = safeLinks.find((l) => l.id === linkId);
    if (!link) return;

    if (!link.title || !link.url) {
      toast.error("Please fill in title and URL");
      return;
    }

    try {
      setSavingId(linkId);

      // Check if it's a new link (temp-id)
      if (link.isNew && linkId.startsWith("temp-")) {
        // Create new link via API
        const response = await createLinks({
          url: link.url,
          title: link.title,
          position: link.position,
          public: link.public,
        });

        // Replace temp link with created link
        if (response) {
          setLinks((prevLinks) => {
            const safeLinks = Array.isArray(prevLinks) ? prevLinks : [];
            return safeLinks.map((l) => (l.id === linkId ? response : l));
          });
          toast.success("Link created successfully");
        }
      } else {
        // Update existing link
        await updateLink({
          id: link.id,
          title: link.title,
          url: link.url,
          position: link.position,
          public: link.public,
          isActive: link.isActive,
        });
        toast.success("Link updated successfully");
      }
    } catch (error) {
      console.error("Failed to save link:", error);
      toast.error("Failed to save link");
    } finally {
      setSavingId(null);
    }
  };

  const handleDuplicateLink = (linkId: string) => {
    const safeLinks = Array.isArray(links) ? links : [];
    const linkToDuplicate = safeLinks.find((l) => l.id === linkId);
    if (!linkToDuplicate) return;

    const duplicate: LinkItem = {
      ...linkToDuplicate,
      id: `temp-${Date.now()}`,
      title: `${linkToDuplicate.title} (Copy)`,
      isActive: true,
      isNew: true,
    };

    const targetIndex = safeLinks.findIndex((l) => l.id === linkId);
    const newLinks = [...safeLinks];
    newLinks.splice(targetIndex + 1, 0, duplicate);
    setLinks(newLinks);
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteLink(deleteConfirmId);
      const safeLinks = Array.isArray(links) ? links : [];
      setLinks(safeLinks.filter((l) => l.id !== deleteConfirmId));
      toast.success("Link deleted");
    } catch (error) {
      console.error("Failed to delete link:", error);
      toast.error("Failed to delete link");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    // Access operation properties with proper type casting through unknown
    const operation = event.operation as unknown as {
      active: { id: string };
      over: { id: string } | null;
    };

    if (!operation?.active || !operation?.over) return;
    if (operation.active.id === operation.over.id) return;

    let newItems: LinkItem[] = [];
    setLinks((items) => {
      const activeIndex = items.findIndex(
        (item) => item.id === operation.active.id,
      );
      const overIndex = items.findIndex(
        (item) => item.id === operation.over?.id,
      );

      if (activeIndex === -1 || overIndex === -1) return items;

      const updatedItems = [...items];
      const [movedItem] = updatedItems.splice(activeIndex, 1);
      updatedItems.splice(overIndex, 0, movedItem);

      // Update position values
      newItems = updatedItems.map((item, idx) => ({
        ...item,
        position: idx,
      }));

      return newItems;
    });

    // Save reordered links to API
    if (newItems.length > 0) {
      for (const link of newItems) {
        if (link.title && link.url && !link.isNew) {
          try {
            await updateLink({
              id: link.id,
              position: link.position,
            });
          } catch (error) {
            console.error(`Failed to update link position ${link.id}:`, error);
          }
        }
      }
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

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div className="flex h-full w-full flex-col bg-zinc-50 font-sans text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <header className="z-10 flex h-14 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-8 dark:border-white/5 dark:bg-[#111]">
          <div className="relative max-w-5xl flex-1">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-4 pl-9 text-sm shadow-sm transition-colors placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5">
              <Bell size={14} />
            </button>
          </div>
        </header>

        <main className="custom-scrollbar w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-8 px-8 py-10 lg:px-12">
            {/* Header Area */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Your Links
                </h1>
                <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Manage everything you share in one place.
                </p>
              </div>
              <button
                onClick={handleAddLink}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <Plus size={16} /> Add link
              </button>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-violet-500 dark:border-zinc-700 dark:border-t-violet-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Loading your links...
                </p>
              </div>
            )}

            {!loading && Array.isArray(links) && links.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-white/1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-white/5">
                  <LinkIcon size={20} />
                </div>
                <h3 className="mb-1 text-base font-bold text-zinc-900 dark:text-white">
                  No links yet
                </h3>
                <p className="mb-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Start building your page by adding your first link.
                </p>
                <button
                  onClick={handleAddLink}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold shadow-sm transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Add your first link
                </button>
              </div>
            )}

            {/* 🔗 Draggable Links List */}
            {!loading && Array.isArray(links) && (
              <DragDropProvider onDragEnd={handleDragEnd}>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <DraggableLinks
                      key={link.id}
                      id={link.id}
                      username={username}
                      index={link}
                      onUpdate={handleUpdateLink}
                      onDuplicate={handleDuplicateLink}
                      onSave={handleSaveLink}
                      onAutoSave={handleAutoSaveLink}
                      savingId={savingId}
                      setDeleteConfirmId={setDeleteConfirmId}
                    />
                  ))}
                </ul>
              </DragDropProvider>
            )}
          </div>
        </main>
      </div>

      {deleteConfirmId && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/20 p-4 backdrop-blur-sm duration-200 dark:bg-black/40">
          <div className="animate-in zoom-in-95 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl duration-200 dark:border-white/10 dark:bg-[#111]">
            <div className="p-6 text-center">
              <h3 className="mb-2 text-lg font-bold text-zinc-950 dark:text-white">
                Delete this link?
              </h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                This action cannot be undone. It will be removed from your
                profile immediately.
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
                className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
