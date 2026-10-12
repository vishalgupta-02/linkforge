"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../(components)/dashboard-layout";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  Server,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  getCustomDomains,
  addCustomDomain,
  verifyCustomDomain,
  deleteCustomDomain,
  type CustomDomainItem,
} from "@/apis/domains";

export default function DomainsPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();

  const plan = userProfile?.data?.plan || null;
  const isPro = Boolean(
    plan && (plan.toUpperCase() === "PRO" || plan.toUpperCase() === "BUSINESS"),
  );

  const [domains, setDomains] = useState<CustomDomainItem[]>([]);
  const [cnameTarget, setCnameTarget] = useState<string>("cname.linkforge.app");
  const [loading, setLoading] = useState<boolean>(true);
  const [newDomain, setNewDomain] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    domainId: string;
    verified: boolean;
    message: string;
    resolvedCnames?: string[];
  } | null>(null);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await getCustomDomains();
      setDomains(res.domains || []);
      if (res.cnameTarget) {
        setCnameTarget(res.cnameTarget);
      }
    } catch (err: any) {
      if (isPro) {
        toast.error(err.response?.data?.message || "Failed to load custom domains");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPro) {
      fetchDomains();
    } else {
      setLoading(false);
    }
  }, [isPro]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      setIsAdding(true);
      const res = await addCustomDomain(newDomain.trim());
      toast.success(
        `Domain ${res.domain.domainName} added! Please configure your DNS CNAME record.`,
      );
      setNewDomain("");
      setDomains((prev) => [res.domain, ...prev]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDns = async (domain: CustomDomainItem, simulate = false) => {
    try {
      setVerifyingId(domain.id);
      setVerificationFeedback(null);
      const res = await verifyCustomDomain(domain.id, simulate);

      setVerificationFeedback({
        domainId: domain.id,
        verified: res.verified,
        message: res.message,
        resolvedCnames: res.resolvedCnames,
      });

      if (res.verified) {
        toast.success(res.message || "DNS verification succeeded!");
        setDomains((prev) =>
          prev.map((d) => (d.id === domain.id ? res.domain : d)),
        );
      } else {
        toast.warning(res.message || "DNS CNAME record not verified yet");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "DNS verification check failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteCustomDomain(deleteConfirmId);
      toast.success("Custom domain removed");
      setDomains((prev) => prev.filter((d) => d.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete domain");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full w-full flex-col bg-zinc-50 px-6 py-6 font-sans text-zinc-950 sm:px-10 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                  <Globe size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Custom Domains
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Connect your own custom apex domain or subdomain with automatic SSL.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} />
                  Pro Plan Active
                </span>
              ) : (
                <button
                  onClick={() => router.push("/pricing")}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-95"
                >
                  <Crown size={14} />
                  Upgrade to Pro to Unlock
                </button>
              )}
            </div>
          </div>

          {/* Pro Gate Banner for Free Tier Users */}
          {!isProfileLoading && !isPro && (
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-8 shadow-sm">
              <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-violet-500/10 blur-2xl" />
              <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    <Sparkles size={12} />
                    Exclusive Pro & Business Feature
                  </div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Bring Your Own Brand Identity with Custom Domains
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ditch <code className="rounded bg-muted px-1.5 py-0.5 text-xs">linkforge.com/username</code> and serve your page directly from <span className="font-semibold text-foreground">links.yourbrand.com</span> or <span className="font-semibold text-foreground">yourname.dev</span>. Includes edge SSL certificates and lightning-fast worldwide routing.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
                  <button
                    onClick={() => router.push("/pricing")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-violet-700 active:scale-95"
                  >
                    <Crown size={15} />
                    Upgrade to Pro Now
                  </button>
                </div>
              </div>

              {/* Interactive Demo Sandbox Preview */}
              <div className="relative mt-8 rounded-xl border border-border bg-background/80 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Configuration Preview
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock size={12} /> Locked Preview
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Example Domain</span>
                    <p className="text-sm font-semibold text-foreground">links.sarahjenkins.design</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Required CNAME</span>
                    <p className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400">cname.linkforge.app</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">SSL Provisioning</span>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={16} /> Automated Let's Encrypt Wildcard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Domains Management (Visible to Pro users or preview mode) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Connect Domain & List */}
            <div className="space-y-6 lg:col-span-2">
              {/* Add Domain Form */}
              <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
                <h2 className="text-base font-semibold">Connect a New Domain</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Enter your apex domain (e.g. <span className="font-mono">creator.me</span>) or subdomain (e.g. <span className="font-mono">links.mybrand.com</span>).
                </p>

                <form onSubmit={handleAddDomain} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Globe size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. links.yourwebsite.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      disabled={!isPro || isAdding}
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-xl border py-2.5 pr-4 pl-9 text-sm transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-hidden disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isPro || isAdding || !newDomain.trim()}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    {isAdding ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Connect Domain
                  </button>
                </form>
              </div>

              {/* Connected Domains List */}
              <div className="rounded-2xl border border-border bg-background shadow-xs">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-base font-semibold">Configured Domains</h2>
                  <span className="text-muted-foreground text-xs font-medium">
                    {domains.length} {domains.length === 1 ? "domain" : "domains"} connected
                  </span>
                </div>

                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground">
                      <RefreshCw size={24} className="mb-2 animate-spin text-violet-500" />
                      Loading configured domains...
                    </div>
                  ) : domains.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Globe size={22} />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">
                        No custom domains connected
                      </h3>
                      <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                        Add your first domain above and configure your DNS provider with the CNAME record.
                      </p>
                    </div>
                  ) : (
                    domains.map((dom) => (
                      <div
                        key={dom.id}
                        className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-base font-semibold text-foreground">
                              {dom.domainName}
                            </span>
                            {dom.verified ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                <Clock size={12} /> Pending CNAME
                              </span>
                            )}
                            {dom.sslProvisioned ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                                <ShieldCheck size={12} /> SSL Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
                                SSL Pending
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {dom.verified && dom.verifiedAt
                              ? `Verified on ${new Date(dom.verifiedAt).toLocaleDateString()}`
                              : `Added ${new Date(dom.createdAt).toLocaleDateString()} · Point CNAME to ${cnameTarget}`}
                          </p>

                          {/* Inline verification feedback message if present */}
                          {verificationFeedback?.domainId === dom.id && (
                            <div
                              className={`mt-2 rounded-lg p-3 text-xs ${
                                verificationFeedback.verified
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-medium">
                                {verificationFeedback.verified ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <AlertCircle size={14} />
                                )}
                                {verificationFeedback.message}
                              </div>
                              {verificationFeedback.resolvedCnames && (
                                <p className="mt-1 font-mono text-[11px] opacity-80">
                                  Resolved: {verificationFeedback.resolvedCnames.join(", ") || "None"}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {dom.verified ? (
                            <a
                              href={`https://${dom.domainName}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <ExternalLink size={13} /> Visit
                            </a>
                          ) : (
                            <button
                              onClick={() => handleVerifyDns(dom, false)}
                              disabled={verifyingId === dom.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-violet-700 disabled:opacity-50"
                            >
                              <RefreshCw
                                size={13}
                                className={verifyingId === dom.id ? "animate-spin" : ""}
                              />
                              {verifyingId === dom.id ? "Checking..." : "Verify DNS"}
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteConfirmId(dom.id)}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            title="Remove Domain"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: DNS Setup Instructions Card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                    <Server size={17} />
                  </div>
                  <h3 className="text-base font-semibold">DNS Configuration</h3>
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed">
                  Log in to your DNS provider (Cloudflare, Namecheap, GoDaddy, Route 53, etc.) and add the following record:
                </p>

                {/* DNS Records Table */}
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-mono font-bold text-foreground">CNAME</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Name / Host</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                        <span>@ or subdomain (e.g. links)</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Target / Value</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                          {cnameTarget}
                        </span>
                        <button
                          onClick={() => handleCopy(cnameTarget, "cname-target")}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Copy CNAME target"
                        >
                          {copiedField === "cname-target" ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">TTL</span>
                      <span className="font-mono font-semibold text-foreground">Automatic / 3600</span>
                    </div>
                  </div>
                </div>

                {/* Helpful tips */}
                <div className="mt-5 space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>
                      <strong>Cloudflare Users:</strong> Set Proxy status to <strong>DNS Only (Grey Cloud)</strong> for automated SSL provisioning.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>
                      DNS changes typically propagate within 5 minutes, but can take up to 24-48 hours depending on your registrar.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="animate-in zoom-in-95 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Remove Custom Domain?</h3>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Your LinkForge profile will no longer resolve through this domain. Any traffic pointing to it will stop reaching your page.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDomain}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Remove Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
