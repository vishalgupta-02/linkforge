"use client";

import React, { useState } from "react";
import { Moon, Sun, Laptop, AlertTriangle } from "lucide-react";

export default function SettingsSubpage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen font-sans">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:py-2">
          {/* <header className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight">
                Settings
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your account, security, and preferences.
              </p>
            </div>
          </header> */}

          <section>
            <h2 className="text-foreground mb-3 px-1 text-sm font-bold tracking-wider uppercase">
              Account
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Email Address"
                description="sarah@example.com"
                isEditing={isEditingEmail}
                setIsEditingEmail={setIsEditingEmail}
                action={
                  <button className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors">
                    Change
                  </button>
                }
              />

              <SettingRow
                title="Account Username"
                description="@sarahdesign"
                action={
                  <button className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                    Change Username
                  </button>
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-foreground mb-3 px-1 text-sm font-bold tracking-wider uppercase">
              Security
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Password"
                description="Last changed 3 months ago"
                action={
                  <button className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors">
                    Update
                  </button>
                }
              />

              <SettingRow
                title="Active Sessions"
                description="Manage devices logged into your account"
                action={
                  <button className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors">
                    View Sessions
                  </button>
                }
              />

              <SettingRow
                title="Log Out All Devices"
                description="Log out from all other active sessions"
                action={
                  <button className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors">
                    Log Out All
                  </button>
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-foreground mb-3 px-1 text-sm font-bold tracking-wider uppercase">
              Preferences
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Theme"
                description="Select your interface color scheme"
                action={
                  <div className="border-border bg-muted/50 flex rounded-lg border p-1">
                    <button
                      onClick={() => {
                        setTheme("light");
                      }}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${theme === "light" ? "bg-background border-border text-foreground border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      title="Light"
                    >
                      <Sun size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setTheme("system");
                      }}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${theme === "system" ? "bg-background border-border text-foreground border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      title="System"
                    >
                      <Laptop size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark");
                      }}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${theme === "dark" ? "bg-background border-border text-foreground border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      title="Dark"
                    >
                      <Moon size={14} />
                    </button>
                  </div>
                }
              />

              <SettingRow
                title="Email Notifications"
                description="Receive updates on product features and news"
                action={
                  <label className="bg-primary relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors focus:outline-none">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <span className="bg-background pointer-events-none block h-4 w-4 translate-x-4 rounded-full shadow-sm transition-transform" />
                  </label>
                }
              />
            </div>
          </section>

          <section className="py-8">
            <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                  <h4 className="text-destructive mb-0.5 flex items-center gap-2 text-sm font-bold">
                    <AlertTriangle size={16} /> Delete Account
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const SettingRow = ({
  title,
  description,
  action,
  isEditing = false,
  setIsEditingEmail,
}: {
  title: string;
  description?: string;
  action: React.ReactNode;
  isEditing?: boolean;
  setIsEditingEmail?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
      {isEditing && (
        <div className="flex items-center gap-2">
          <input
            type="email"
            className="border-border bg-background text-foreground focus:ring-primary block w-full rounded-md border shadow-sm focus:ring-1 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="border-border bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors">
            Save
          </button>
          <button
            className="border-border bg-muted text-muted-foreground hover:bg-muted/90 inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors"
            onClick={() => setIsEditingEmail?.(false)}
          >
            Cancel
          </button>
        </div>
      )}
      <div>
        <h4 className="text-foreground text-sm font-medium">{title}</h4>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        )}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
};
