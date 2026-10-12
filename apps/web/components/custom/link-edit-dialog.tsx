"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Crown,
  Lock,
  Sparkles,
  X,
  Check,
  FolderPlus,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import type { Link, LinkSection } from "@vyrex/types";
import { useRouter } from "next/navigation";

interface LinkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
  sections: LinkSection[];
  isPro: boolean;
  onSave: (linkId: string, updates: Partial<Link>) => Promise<void>;
  onCreateSection?: (title: string) => Promise<LinkSection | undefined>;
}

export function LinkEditDialog({
  isOpen,
  onClose,
  link,
  sections,
  isPro,
  onSave,
  onCreateSection,
}: LinkEditDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [scheduledStart, setScheduledStart] = useState<string>("");
  const [scheduledEnd, setScheduledEnd] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [showNewSectionInput, setShowNewSectionInput] = useState(false);

  // Convert ISO to datetime-local input string format (YYYY-MM-DDTHH:mm)
  const toLocalInput = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (link) {
      setTitle(link.title || "");
      setUrl(link.url || "");
      setSectionId(link.sectionId || null);
      setScheduledStart(toLocalInput(link.scheduledStart));
      setScheduledEnd(toLocalInput(link.scheduledEnd));
      setShowNewSectionInput(false);
      setNewSectionTitle("");
    }
  }, [link]);

  if (!isOpen || !link) return null;

  // Realtime schedule status badge computation
  const getScheduleStatus = () => {
    if (!scheduledStart && !scheduledEnd) {
      return { label: "Always Active", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" };
    }
    const now = new Date();
    const start = scheduledStart ? new Date(scheduledStart) : null;
    const end = scheduledEnd ? new Date(scheduledEnd) : null;

    if (start && now < start) {
      return { label: "Scheduled (Future)", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" };
    }
    if (end && now > end) {
      return { label: "Expired", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" };
    }
    return { label: "Live Now", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" };
  };

  const scheduleStatus = getScheduleStatus();

  const handleApplyPreset = (type: "start" | "end", hoursAhead: number) => {
    const target = new Date(Date.now() + hoursAhead * 3600 * 1000);
    const val = toLocalInput(target.toISOString());
    if (type === "start") setScheduledStart(val);
    else setScheduledEnd(val);
  };

  const handleCreateNewSection = async () => {
    if (!newSectionTitle.trim() || !onCreateSection) return;
    try {
      setIsCreatingSection(true);
      const created = await onCreateSection(newSectionTitle.trim());
      if (created) {
        setSectionId(created.id);
        setShowNewSectionInput(false);
        setNewSectionTitle("");
      }
    } finally {
      setIsCreatingSection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    try {
      setIsSaving(true);
      const updates: Partial<Link> = {
        title: title.trim(),
        url: url.trim(),
        sectionId: sectionId || null,
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
      };

      await onSave(link.id, updates);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Edit Link Details & Schedule
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${scheduleStatus.color}`}
            >
              {scheduleStatus.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {/* Title & URL inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Link"
                required
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-black"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Destination URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-zinc-900 transition-colors focus:border-violet-500 focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-black"
              />
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-white/5 dark:bg-white/2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <FolderPlus size={14} className="text-violet-500" />
                Section Header Group
              </label>
              {!isPro && (
                <span className="flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                  <Lock size={10} /> Pro
                </span>
              )}
            </div>

            {!isPro ? (
              <p className="text-xs text-zinc-500">
                Organizing links into categorized sections is a Pro feature.
              </p>
            ) : (
              <>
                <select
                  value={sectionId || ""}
                  onChange={(e) => setSectionId(e.target.value ? e.target.value : null)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-violet-500 focus:outline-hidden dark:border-white/10 dark:bg-[#111] dark:text-white"
                >
                  <option value="">No Section (Default)</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title}
                    </option>
                  ))}
                </select>

                {!showNewSectionInput ? (
                  <button
                    type="button"
                    onClick={() => setShowNewSectionInput(true)}
                    className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
                  >
                    + Create new section header
                  </button>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Featured Projects"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-900 focus:border-violet-500 focus:outline-hidden dark:border-white/10 dark:bg-[#111] dark:text-white"
                    />
                    <button
                      type="button"
                      disabled={isCreatingSection || !newSectionTitle.trim()}
                      onClick={handleCreateNewSection}
                      className="cursor-pointer rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                      {isCreatingSection ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewSectionInput(false)}
                      className="cursor-pointer rounded-lg border border-zinc-200 px-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date & Time Scheduling Section */}
          <div className="space-y-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 dark:bg-violet-500/3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Link Scheduling Window
                </h3>
              </div>
              {!isPro ? (
                <span className="flex items-center gap-1 rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300">
                  <Crown size={11} /> Pro Feature
                </span>
              ) : null}
            </div>

            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Set automated start and expiration dates for product launches, limited discounts, and seasonal campaigns. Link will automatically hide and redirect clicks will be safely rejected outside this timeframe.
            </p>

            {!isPro ? (
              <div className="rounded-xl border border-violet-500/20 bg-white/70 p-4 text-center dark:bg-black/30">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Lock size={15} />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Upgrade to Schedule Links
                </h4>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Time-gated links allow you to automate content changes without manual intervention.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/pricing")}
                  className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Crown size={12} />
                  Upgrade to Pro
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Start Date Picker */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <Clock size={12} className="text-zinc-400" /> Goes Live At (Start)
                    </label>
                    {scheduledStart && (
                      <button
                        type="button"
                        onClick={() => setScheduledStart("")}
                        className="cursor-pointer text-[11px] text-zinc-400 hover:text-red-500"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-violet-500 focus:outline-hidden dark:border-white/10 dark:bg-[#111] dark:text-white"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("start", 24)}
                      className="cursor-pointer rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                    >
                      +24 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("start", 72)}
                      className="cursor-pointer rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                    >
                      +3 Days
                    </button>
                  </div>
                </div>

                {/* End Date Picker */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      <Clock size={12} className="text-zinc-400" /> Expires At (End)
                    </label>
                    {scheduledEnd && (
                      <button
                        type="button"
                        onClick={() => setScheduledEnd("")}
                        className="cursor-pointer text-[11px] text-zinc-400 hover:text-red-500"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-900 shadow-xs focus:border-violet-500 focus:outline-hidden dark:border-white/10 dark:bg-[#111] dark:text-white"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("end", 168)}
                      className="cursor-pointer rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("end", 720)}
                      className="cursor-pointer rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                    >
                      +30 Days
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
