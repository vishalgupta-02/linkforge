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
  CheckCircle2,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { useBillingPortal } from "@/hooks/use-billing-portal";
import { useCreateCheckout } from "@/hooks/use-create-checkout";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function SettingsSubpage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const { data: session } = authClient.useSession();
  const { data: userProfile } = useUserProfile();
  const { data: billingStatus, isLoading: isBillingLoading } =
    useBillingStatus();
  const { mutate: openPortal, isPending: isPortalPending } = useBillingPortal();
  const { mutate: openCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const subscriptionStatus =
    billingStatus?.data?.subscriptionStatus || "INACTIVE";
  const nextBillingDate = billingStatus?.data?.nextBillingDate
    ? new Date(billingStatus.data.nextBillingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const isCanceling = billingStatus?.data?.cancelAtPeriodEnd;

  const handleRevokeAllSessions = async () => {
    try {
      setIsRevokingSessions(true);
      await authClient.revokeOtherSessions();
      toast.success("All other active sessions have been logged out.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke other sessions.");
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!session?.user?.email) {
      toast.error("User email not found");
      return;
    }
    toast.info(`Password management is active for ${session.user.email}`);
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen font-sans">
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          <section>
            <h2 className="text-foreground mb-3 px-1 text-sm font-bold tracking-wider uppercase">
              Account
            </h2>
            <div className="border-border bg-background divide-border divide-y rounded-xl border px-5 shadow-sm">
              <SettingRow
                title="Email Address"
                description={session?.user?.email || "No email available"}
                action={
                  <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors"
                  >
                    View in Profile
                  </button>
                }
              />

              <SettingRow
                title="Account Username"
                description={
                  userProfile?.data?.userName
                    ? `@${userProfile.data.userName}`
                    : "No username configured yet"
                }
                action={
                  <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-lg px-4 text-xs font-medium shadow-sm transition-colors"
                  >
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
                        className="border-border bg-background text-foreground hover:bg-muted inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-xs font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isPortalPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CreditCard size={12} />
                        )}
                        {isPortalPending
                          ? "Opening Portal..."
                          : "Manage Subscription"}
                      </button>
                    ) : (
                      <button
                        onClick={() => openCheckout()}
                        disabled={isCheckoutPending || isBillingLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isCheckoutPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                        {isCheckoutPending
                          ? "Redirecting..."
                          : "Upgrade to Pro"}
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
                      title={
                        isCanceling ? "Access Expires" : "Next Billing Date"
                      }
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
                title="Account Security"
                description={`Authenticated via Better Auth (${session?.user?.email || "User session"})`}
                action={
                  <button
                    onClick={handlePasswordReset}
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors"
                  >
                    Check Status
                  </button>
                }
              />

              <SettingRow
                title="Log Out Other Devices"
                description="Revoke all active sessions on other devices and browsers"
                action={
                  <button
                    onClick={handleRevokeAllSessions}
                    disabled={isRevokingSessions}
                    className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isRevokingSessions ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : null}
                    Log Out Others
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
                description="Select your preferred application color scheme"
                action={
                  <div className="border-border bg-muted/50 flex rounded-lg border p-1">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${
                        mounted && theme === "light"
                          ? "bg-background border-border text-foreground border shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Light"
                    >
                      <Sun size={14} />
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${
                        mounted && theme === "system"
                          ? "bg-background border-border text-foreground border shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="System"
                    >
                      <Laptop size={14} />
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex h-7 w-10 items-center justify-center rounded-md transition-all duration-200 ${
                        mounted && theme === "dark"
                          ? "bg-background border-border text-foreground border shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Dark"
                    >
                      <Moon size={14} />
                    </button>
                  </div>
                }
              />

              <SettingRow
                title="Email Notifications"
                description="Receive updates on weekly click summaries and milestone badges"
                action={
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !notificationsEnabled;
                      setNotificationsEnabled(nextVal);
                      toast.success(
                        nextVal
                          ? "Email notifications enabled"
                          : "Email notifications disabled",
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                      notificationsEnabled
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        notificationsEnabled
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                }
              />
            </div>
          </section>

          <section className="py-4">
            <div className="bg-destructive/5 rounded-xl border border-red-500/30 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-1">
                  <h4 className="mb-0.5 flex items-center gap-2 text-sm font-bold text-red-500">
                    <AlertTriangle size={16} /> Danger Zone
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Sign out of your account across this device.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    window.dispatchEvent(new Event("logout-event"));
                    toast.success("Signed out successfully");
                    router.push("/");
                  }}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-red-500/10 px-4 text-sm font-medium text-red-500 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                >
                  Sign Out
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
}: {
  title: string;
  description?: string;
  action: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
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
