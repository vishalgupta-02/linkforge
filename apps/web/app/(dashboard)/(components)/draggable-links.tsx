"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { Copy, Globe, GripVertical, Trash2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Link } from "@/apis/get-links";
import { toast } from "sonner";

interface LinkItem extends Link {
  isNew?: boolean;
}

interface DraggableLinksProps {
  id: string;
  index: LinkItem;
  username: string | null;
  onUpdate: (linkId: string, updates: Partial<LinkItem>) => void;
  onDuplicate: (linkId: string) => void;
  onSave: (linkId: string) => Promise<void>;
  onAutoSave: (linkId: string) => Promise<void>;
  savingId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
}

const DraggableLinks = ({
  id,
  index,
  username,
  onUpdate,
  onDuplicate,
  onSave,
  onAutoSave,
  savingId,
  setDeleteConfirmId,
}: DraggableLinksProps) => {
  const [element, setElement] = useState<Element | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const { isDragging } = useSortable({
    id,
    index: index.position,
    element,
    handle: handleRef,
  });

  const updateLink = (updates: Partial<LinkItem>) => {
    onUpdate(index.id, updates);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!index.public) {
      toast.warning("Make this link public to share it");
      return;
    }

    if (!username) {
      toast.warning("Set up your username before sharing links");
      return;
    }

    const shareUrl = `${window.location.origin}/public/${username}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(index.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <li ref={setElement} className="item" data-shadow={isDragging || undefined}>
      <div
        className={`group flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-50/50 hover:shadow-md sm:flex-row sm:items-start sm:gap-4 dark:border-white/5 dark:bg-[#111] dark:hover:bg-white/3 ${!index.isActive ? "opacity-60 grayscale-[20%]" : ""}`}
      >
        <div className="flex flex-1 items-start gap-3 sm:gap-4">
          <button
            ref={handleRef}
            className="touch:bg-zinc-50 dark:touch:bg-white/5 flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg text-zinc-300 transition-all hover:bg-zinc-100 hover:text-zinc-500 active:scale-95 active:cursor-grabbing dark:text-zinc-600 dark:hover:bg-white/10 dark:hover:text-zinc-400"
            title="Drag to reorder"
          >
            <GripVertical size={18} />
          </button>

          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-400 dark:border-white/5 dark:bg-white/5 dark:text-zinc-500">
            <Globe size={18} />
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col justify-center">
            <InlineInput
              value={index.title}
              onChange={(val) => updateLink({ title: val })}
              onBlur={() => onAutoSave(index.id)}
              className="text-[15px] font-bold text-zinc-950 dark:text-white"
              placeholder="Link Title"
            />
            <InlineInput
              value={index.url}
              onChange={(val) => updateLink({ url: val })}
              onBlur={() => onAutoSave(index.id)}
              className="mt-0.5 text-[13px] font-medium text-zinc-500 dark:text-zinc-400"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center justify-between gap-2 opacity-100 transition-opacity sm:gap-3 sm:opacity-0 sm:group-hover:opacity-100">
            <div className="flex items-center gap-1">
              {index.public && (
                <button
                  onClick={handleShare}
                  className={`rounded-lg p-2 transition-colors ${
                    copiedId === index.id
                      ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                  title={copiedId === index.id ? "Copied!" : "Copy share link"}
                >
                  <Share2 size={16} />
                </button>
              )}
              <button
                onClick={() => onDuplicate(index.id || "")}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
                title="Duplicate"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(index.id)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:hidden">
              <button
                onClick={async () => {
                  const newIsActive = !index.isActive;
                  onUpdate(index.id, {
                    isActive: newIsActive,
                    public: newIsActive ? index.public : false,
                  });
                  await onAutoSave(index.id);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  index.isActive
                    ? "bg-violet-500 hover:bg-violet-600"
                    : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                }`}
                title="Active/Inactive"
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    index.isActive ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>

              <button
                onClick={async () => {
                  if (index.isActive) {
                    onUpdate(index.id, { public: !index.public });
                    await onAutoSave(index.id);
                  }
                }}
                disabled={!index.isActive}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  index.isActive
                    ? index.public
                      ? "cursor-pointer bg-blue-500 hover:bg-blue-600"
                      : "cursor-pointer bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                    : "cursor-not-allowed bg-zinc-200 opacity-50 dark:bg-zinc-700"
                }`}
                title={
                  index.isActive
                    ? "Public/Private"
                    : "Activate link to make it public"
                }
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    index.public ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="hidden h-6 w-px bg-zinc-200 sm:block dark:bg-white/10" />

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <button
              onClick={() => onSave(index.id)}
              disabled={savingId === index.id}
              className="inline-flex h-6 items-center gap-2 rounded-lg bg-violet-500 px-3 text-xs font-semibold whitespace-nowrap text-white shadow-sm transition-all hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingId === index.id ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              Save
            </button>

            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10" />

            {index.public && (
              <>
                <button
                  onClick={handleShare}
                  className={`inline-flex h-6 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all ${
                    copiedId === index.id
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  title={copiedId === index.id ? "Copied!" : "Copy share link"}
                >
                  <Share2 size={12} />
                  {copiedId === index.id ? "Copied!" : "Share"}
                </button>
                <div className="h-6 w-px bg-zinc-200 dark:bg-white/10" />
              </>
            )}

            <button
              onClick={async () => {
                const newIsActive = !index.isActive;
                onUpdate(index.id, {
                  isActive: newIsActive,
                  public: newIsActive ? index.public : false,
                });
                await onAutoSave(index.id);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                index.isActive
                  ? "bg-violet-500 hover:bg-violet-600"
                  : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
              }`}
              title="Active/Inactive"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  index.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <div className="h-6 w-px bg-zinc-200 dark:bg-white/10" />

            <button
              onClick={async () => {
                if (index.isActive) {
                  onUpdate(index.id, { public: !index.public });
                  await onAutoSave(index.id);
                }
              }}
              disabled={!index.isActive}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                index.isActive
                  ? index.public
                    ? "cursor-pointer bg-blue-500 hover:bg-blue-600"
                    : "cursor-pointer bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                  : "cursor-not-allowed bg-zinc-200 opacity-50 dark:bg-zinc-700"
              }`}
              title={
                index.isActive
                  ? "Public/Private"
                  : "Activate link to make it public"
              }
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  index.public ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default DraggableLinks;

const InlineInput = ({
  value,
  onChange,
  onBlur,
  className,
  placeholder,
  autoFocus = false,
}: {
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  className: string;
  placeholder: string;
  autoFocus?: boolean;
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) onChange(localValue);
    if (onBlur) onBlur();
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`-ml-2 w-full rounded border border-transparent bg-transparent px-2 transition-all outline-none placeholder:text-zinc-400 hover:bg-zinc-100 focus:border-zinc-200 focus:bg-white focus:ring-1 focus:ring-violet-500 dark:placeholder:text-zinc-600 dark:hover:bg-white/5 dark:focus:border-white/10 dark:focus:bg-[#0a0a0a] ${className}`}
    />
  );
};
