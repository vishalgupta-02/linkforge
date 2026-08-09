"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  Globe,
  LayoutGrid,
  Search,
  HelpCircle,
  Laptop,
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-zinc-900 selection:text-white">
      <aside className="z-20 hidden w-64 flex-col border-r border-zinc-200 bg-white p-4 md:flex">
        <div className="mt-2 mb-8 flex items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-sm">
            <div className="h-3 w-3 rounded-sm bg-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Acme Corp
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          <NavItem icon={<LayoutGrid size={16} />} label="Overview" />
          <NavItem icon={<Bell size={16} />} label="Notifications" />
          <NavItem icon={<User size={16} />} label="Profile" active />

          <div className="px-2 pt-6 pb-2 text-xs font-semibold text-zinc-500">
            Workspace
          </div>
          <NavItem icon={<Globe size={16} />} label="Domains" />
          <NavItem icon={<Laptop size={16} />} label="Integrations" />
        </nav>

        <div className="mt-auto border-t border-zinc-200 px-2 pt-4">
          <NavItem icon={<HelpCircle size={16} />} label="Support" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-8">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search workspaces..."
              className="w-full rounded-md border border-zinc-200 bg-zinc-50/50 py-1.5 pr-4 pl-9 text-sm shadow-sm transition-colors placeholder:text-zinc-500 focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <Bell size={14} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  Edit Profile
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Update your personal details and public presence.
                </p>
              </div>

              <div
                className={`flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-all duration-300 ${showSuccess ? "translate-y-0 transform opacity-100" : "pointer-events-none -translate-y-2 transform opacity-0"}`}
              >
                <CheckCircle2 size={16} />
                Profile updated
              </div>
            </div>

            <form
              onSubmit={handleSave}
              className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="space-y-8 p-6 md:p-8">
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  <div className="group relative shrink-0 cursor-pointer">
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200 transition-all duration-200 md:h-24 md:w-24">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/40 text-white opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                        <Camera size={20} className="mb-1" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                      Profile Picture
                    </h2>
                    <p className="mt-1 mb-3 max-w-sm text-sm text-zinc-500">
                      This will be displayed on your profile and in workspaces.
                      We support PNG, JPEGs and GIFs under 10MB.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium whitespace-nowrap shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm leading-none font-medium text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Alex Rivera"
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm leading-none font-medium text-zinc-700">
                      Username{" "}
                      <span className="ml-1 font-normal text-zinc-400">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-500">
                        @
                      </span>
                      <input
                        type="text"
                        defaultValue="arivera"
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 py-2 pr-3 pl-8 text-sm shadow-sm transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm leading-none font-medium text-zinc-700">
                      Job Title
                    </label>
                    <input
                      type="text"
                      defaultValue="Senior Product Designer"
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:outline-none md:max-w-md"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm leading-none font-medium text-zinc-700">
                        Bio
                      </label>
                      <span className="text-xs text-zinc-400">120 / 160</span>
                    </div>
                    <textarea
                      defaultValue="Designing tools that help developers move faster. Currently building the future of web infrastructure at Acme Corp."
                      className="flex min-h-[100px] w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm shadow-sm transition-colors focus:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:outline-none"
                    />
                    <p className="text-[13px] text-zinc-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-zinc-200 bg-zinc-50/80 px-6 py-4">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-9 min-w-[120px] items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-50 shadow transition-all hover:bg-zinc-900/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ icon, label, active = false }: NavItemProps) => (
  <button
    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-zinc-100 text-zinc-900"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
