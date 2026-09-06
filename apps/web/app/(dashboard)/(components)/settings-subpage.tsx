"use client";

import React, { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
  Loader2,
  Sparkles,
  CreditCard,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { useBillingPortal } from "@/hooks/use-billing-portal";
import { useCreateCheckout } from "@/hooks/use-create-checkout";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export default function SettingsSubpage() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { data: session } = authClient.useSession();
  const { data: userProfile } = useUserProfile();
  const { data: billingStatus, isLoading: isBillingLoading } =
    useBillingStatus();
  const { mutate: openPortal, isPending: isPortalPending } = useBillingPortal();
  const { mutate: openCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  // Invalidate queries when returning from Stripe checkout or portal
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      queryClient.invalidateQueries({ queryKey: ["billingStatus"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    }
  }, [searchParams, queryClient]);

  const plan = billingStatus?.data?.plan || userProfile?.data?.plan || "FREE";
  const isPro =
    plan.toUpperCase() === "PRO" || plan.toUpperCase() === "BUSINESS";
  const subscriptionStatus = billingStatus?.data?.subscriptionStatus || "INACTIVE";
  const nextBillingDate = billingStatus?.data?.nextBillingDate
    ? new Date(billingStatus.data.nextBillingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const isCanceling = billingStatus?.data?.cancelAtPeriodEnd;

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen font-sans">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:py-2">
          <section>
            <h2 className="text-foreground mb-3 px-1 text-sm font-bold tracking-wider uppercase">
              Account
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Email Address"
                description={session?.user?.email || "sarah@example.com"}
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
                description={
                  userProfile?.data?.userName
                    ? `@${userProfile.data.userName}`
                    : "@sarahdesign"
                }
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
              Subscription & Billing
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Current Plan"
                description={
                  isPro
                    ? "You are on the Pro plan with unlimited links, custom themes, and advanced analytics."
                    : "You are on the Free plan. Upgrade to Pro for unlimited links, live visitors, and advanced analytics."
                }
                action={
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isPro
                          ? "bg-primary/10 text-primary border-primary/20 border"
                          : "bg-muted text-muted-foreground border-border border"
                      }`}
                    >
                      {isPro && <Sparkles size={12} className="shrink-0" />}
                      {isPro ? "PRO" : "FREE"}
                    </span>
                    {isPro ? (
                      <button
                        onClick={() => openPortal()}
                        disabled={isPortalPending || isBillingLoading}
                        className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isPortalPending ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CreditCard size={15} />
                        )}
                        {isPortalPending
                          ? "Opening Portal..."
                          : "Manage Subscription"}
                      </button>
                    ) : (
                      <button
                        onClick={() => openCheckout()}
                        disabled={isCheckoutPending || isBillingLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isCheckoutPending ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Sparkles size={15} />
                        )}
                        {isCheckoutPending ? "Redirecting..." : "Upgrade to Pro"}
                      </button>
                    )}
                  </div>
                }
              />

              {isPro && (
                <>
                  <SettingRow
                    title="Subscription Status"
                    description={
                      isCanceling
                        ? "Canceling — access remains active until the end of your billing period."
                        : `Status: ${subscriptionStatus.toLowerCase()}`
                    }
                    action={
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isCanceling
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {isCanceling ? "Canceling" : subscriptionStatus}
                      </span>
                    }
                  />

                  {nextBillingDate && (
                    <SettingRow
                      title={isCanceling ? "Access Expires" : "Next Billing Date"}
                      description={
                        isCanceling
                          ? `Your Pro subscription access ends on ${nextBillingDate}.`
                          : `Your next renewal payment will process on ${nextBillingDate}.`
                      }
                      action={
                        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                          <Calendar size={13} />
                          {nextBillingDate}
                        </span>
                      }
                    />
                  )}
                </>
              )}
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
