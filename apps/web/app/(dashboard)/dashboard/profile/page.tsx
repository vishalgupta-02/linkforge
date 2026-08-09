"use client";

import React, { useState } from "react";
import {
  User,
  Link as LinkIcon,
  Palette,
  BarChart3,
  Shield,
  Camera,
  BadgeCheck,
  Plus,
  GripVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import DashboardLayout from "@/app/(dashboard)/(components)/dashboard-layout";

export default function CreatorDashboardProfile() {
  const [activeTab, setActiveTab] = useState<
    "general" | "links" | "appearance"
  >("general");

  return (
    <DashboardLayout>
      <div className="flex h-full w-full flex-col bg-zinc-50 font-sans text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <main className="custom-scrollbar w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col space-y-8 px-8 py-10 lg:px-12">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Profile Settings
              </h1>
              <p className="mt-1 text-sm font-medium text-zinc-500">
                Manage your public identity, links, and appearance.
              </p>
            </div>

            <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-white/10">
              <TabButton
                icon={<User size={14} />}
                label="General"
                active={activeTab === "general"}
                onClick={() => setActiveTab("general")}
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
              <TabButton
                icon={<BarChart3 size={14} />}
                label="Analytics"
                active={false}
              />
              <TabButton
                icon={<Shield size={14} />}
                label="Security"
                active={false}
              />
            </div>

            {activeTab === "general" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
                <div className="flex flex-col items-start gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center dark:border-white/5 dark:bg-[#111]">
                  <div className="group relative shrink-0 cursor-pointer">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-100 shadow-sm ring-2 ring-zinc-100 dark:bg-zinc-800 dark:ring-white/10">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                        alt="Avatar"
                        width={800}
                        height={800}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                        <Camera size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex-1">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="mb-1 flex items-center gap-1.5">
                          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                            Sarah Creative
                          </h2>
                          <BadgeCheck size={16} className="text-violet-500" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500">
                          linkforge.bio/sarah
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          sarah@example.com
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black">
                          Upload new
                        </button>
                        <button className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#111]">
                  <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 md:p-8">
                    <FormInput
                      label="Display Name"
                      defaultValue="Sarah Creative"
                    />
                    <FormInput
                      label="Username"
                      defaultValue="sarah"
                      prefix="linkforge.bio/"
                    />
                    <div className="md:col-span-2">
                      <FormTextarea
                        label="Bio"
                        defaultValue="Digital artist & designer. ✨ Sharing my journey, design resources, and latest drops."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput
                        label="Account Email"
                        defaultValue="sarah@example.com"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-white/5 dark:bg-[#0a0a0a]">
                    <button className="h-9 rounded-lg px-4 text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
                      Cancel
                    </button>
                    <button className="h-9 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "links" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Manage Links
                  </h2>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]">
                    <Plus size={16} /> Add new link
                  </button>
                </div>

                {/* Draggable Links List */}
                <div className="space-y-3">
                  <LinkItem
                    title="Latest YouTube Video"
                    url="https://youtube.com/watch?v=..."
                    active
                  />
                  <LinkItem
                    title="Download my Brushes"
                    url="https://store.sarah.design/brushes"
                    active
                  />
                  <LinkItem
                    title="My Portfolio Website"
                    url="https://sarah.design"
                    active={false}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
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
    onClick={onClick}
    className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
      active
        ? "text-zinc-950 dark:text-white"
        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
    }`}
  >
    {icon} {label}
    {active && (
      <span className="absolute right-0 -bottom-px left-0 h-0.5 rounded-t-full bg-zinc-950 dark:bg-white" />
    )}
  </button>
);

const FormInput = ({ label, defaultValue, prefix, disabled }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
      {label}
    </label>
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-3 text-sm font-medium text-zinc-500">
          {prefix}
        </span>
      )}
      <input
        type="text"
        defaultValue={defaultValue}
        disabled={disabled}
        className={`flex h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-[#0a0a0a] ${prefix ? "pl-18" : "px-3"} py-2 text-sm text-zinc-900 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white`}
      />
    </div>
  </div>
);

const FormTextarea = ({ label, defaultValue }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <span className="text-xs text-zinc-500">120 / 160</span>
    </div>
    <textarea
      defaultValue={defaultValue}
      className="flex min-h-25 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
    />
  </div>
);

const LinkItem = ({ title, url, active }: any) => (
  <div className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-[#111]">
    <button className="cursor-grab text-zinc-400 hover:text-zinc-600 active:cursor-grabbing dark:hover:text-zinc-200">
      <GripVertical size={18} />
    </button>

    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
      <input
        type="text"
        defaultValue={title}
        className="flex h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-sm font-bold text-zinc-900 transition-all outline-none hover:border-zinc-200 focus:border-zinc-200 focus:bg-zinc-50 dark:text-white dark:hover:border-white/10 dark:focus:border-white/10 dark:focus:bg-[#0a0a0a]"
      />
      <input
        type="text"
        defaultValue={url}
        className="flex h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-sm text-zinc-500 transition-all outline-none hover:border-zinc-200 focus:border-zinc-200 focus:bg-zinc-50 dark:hover:border-white/10 dark:focus:border-white/10 dark:focus:bg-[#0a0a0a]"
      />
    </div>

    <div className="flex items-center gap-3 border-l border-zinc-100 pl-2 dark:border-white/5">
      {/* shadcn style Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={active}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
          active ? "bg-violet-600" : "bg-zinc-200 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform ${active ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
      <button className="text-zinc-400 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
);

const NavItem = ({ icon, label, active = false }: any) => (
  <button
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-zinc-200"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
