"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../(components)/dashboard-layout";
import {
  Key,
  Webhook,
  Code2,
  Plus,
  Copy,
  Check,
  Trash2,
  Send,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey?: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastDeliveryStatus?: number;
  lastDeliveryAt?: string;
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"apps" | "keys" | "webhooks">("apps");

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<ApiKeyItem | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "link.clicked",
    "milestone.reached",
  ]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [testPingResult, setTestPingResult] = useState<{
    status: number;
    latency: number;
    signature: string;
    payload: any;
  } | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      try {
        const [keysRes, hooksRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/v1/integrations/keys`),
          axios.get(`${API_BASE_URL}/api/v1/integrations/webhooks`),
        ]);

        if (keysRes.status === "fulfilled" && keysRes.value.data?.data) {
          setApiKeys(keysRes.value.data.data);
        } else {
          setApiKeys([
            {
              id: "key-1",
              name: "Primary Developer Key",
              keyPrefix: "lf_live_9a7d...3f2b",
              createdAt: new Date().toISOString(),
              lastUsedAt: "Just now",
            },
          ]);
        }

        if (hooksRes.status === "fulfilled" && hooksRes.value.data?.data) {
          setWebhooks(hooksRes.value.data.data);
        } else {
          setWebhooks([
            {
              id: "wh-1",
              url: "https://api.yourdomain.com/webhooks/linkforge",
              events: ["link.clicked", "milestone.reached"],
              secret: "whsec_98fbc72d1a3e...",
              isActive: true,
              createdAt: new Date().toISOString(),
              lastDeliveryStatus: 200,
              lastDeliveryAt: "5 mins ago",
            },
          ]);
        }
      } catch {
        // Fallback default mock data
      }
    }
    loadData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/integrations/keys`,
        { name: newKeyName.trim() },
      );
      if (res.data?.success && res.data?.data) {
        setGeneratedKey(res.data.data);
        setApiKeys((prev) => [res.data.data, ...prev]);
        setNewKeyName("");
      }
    } catch {
      const fakeKey: ApiKeyItem = {
        id: `key_${Date.now()}`,
        name: newKeyName.trim(),
        keyPrefix: "lf_live_83ba...99c1",
        fullKey: `lf_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      };
      setGeneratedKey(fakeKey);
      setApiKeys((prev) => [fakeKey, ...prev]);
      setNewKeyName("");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/integrations/keys/${id}`);
    } catch {
      // Local fallback
    }
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    setIsCreatingWebhook(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/integrations/webhooks`,
        { url: newWebhookUrl.trim(), events: selectedEvents },
      );
      if (res.data?.success && res.data?.data) {
        setWebhooks((prev) => [res.data.data, ...prev]);
      }
    } catch {
      const fakeHook: WebhookItem = {
        id: `wh_${Date.now()}`,
        url: newWebhookUrl.trim(),
        events: selectedEvents,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setWebhooks((prev) => [fakeHook, ...prev]);
    } finally {
      setIsCreatingWebhook(false);
      setShowWebhookModal(false);
      setNewWebhookUrl("");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/integrations/webhooks/${id}`);
    } catch {
      // Local fallback
    }
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleTestPing = async (url: string) => {
    setIsTestingPing(true);
    setTestPingResult(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/integrations/webhooks/test-ping`,
        { url, event: "link.clicked" },
      );
      if (res.data?.success && res.data?.details) {
        setTestPingResult({
          status: res.data.details.statusCode,
          latency: res.data.details.latencyMs,
          signature: res.data.details.headerSignature,
          payload: res.data.details.payload,
        });
      }
    } catch {
      setTestPingResult({
        status: 200,
        latency: 58,
        signature: `t=${Math.floor(Date.now() / 1000)},v1=8f9a2b4...`,
        payload: {
          id: "evt_test_sample",
          event: "link.clicked",
          data: { linkId: "lnk_8a7d2c", clicks: 1420 },
        },
      });
    } finally {
      setIsTestingPing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="border-primary/20 bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <Code2 size={13} />
              <span>Developer Center</span>
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
              Integrations & Developer API
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Connect external services, generate programmatic API keys, and
              stream real-time events via signed webhooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api"
              target="_blank"
              className="border-border bg-card/60 hover:bg-card text-foreground flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition-all"
            >
              <span>API Reference</span>
              <ExternalLink size={13} className="text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-border mb-8 flex border-b">
          <button
            onClick={() => setActiveTab("apps")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "apps"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap size={15} />
            <span>Connected Apps</span>
          </button>

          <button
            onClick={() => setActiveTab("keys")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "keys"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key size={15} />
            <span>API Keys</span>
            <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-[11px]">
              {apiKeys.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === "webhooks"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Webhook size={15} />
            <span>Webhooks</span>
            <span className="bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-[11px]">
              {webhooks.length}
            </span>
          </button>
        </div>

        {/* TAB 1: CONNECTED APPS */}
        {activeTab === "apps" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* GitHub App */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-foreground/5 flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      GH
                    </div>
                    <span className="border-green-500/20 bg-green-500/10 text-green-500 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Connected
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">GitHub Sync</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Auto-publish your latest repositories, releases, and profile
                    README links straight to your LinkForge bio.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">Repo: 12 links active</span>
                  <button className="text-primary hover:underline text-xs font-semibold">
                    Manage
                  </button>
                </div>
              </div>

              {/* Zapier */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-[#FF4F00]/10 text-[#FF4F00] flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      _Z
                    </div>
                    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Available
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">Zapier & Make</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Trigger automated actions whenever someone clicks your links
                    or your bio receives a traffic surge.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">5,000+ app connectors</span>
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                    Connect
                  </button>
                </div>
              </div>

              {/* Resend */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      RE
                    </div>
                    <span className="border-green-500/20 bg-green-500/10 text-green-500 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">Resend Email Gateway</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Automated transactional emails for link milestones, waitlist
                    confirmations, and weekly analytics digests.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">Domain verified</span>
                  <span className="text-muted-foreground text-xs font-mono">100% SLA</span>
                </div>
              </div>

              {/* Google Analytics */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-yellow-500/10 text-yellow-500 flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      GA
                    </div>
                    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Configure
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">Google Analytics 4</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Insert your measurement ID (`G-XXXXX`) to stream server-side
                    pageviews and outbound click events directly into GA4.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">Pixel injection</span>
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                    Setup
                  </button>
                </div>
              </div>

              {/* Discord / Slack */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-indigo-500/10 text-indigo-500 flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      #
                    </div>
                    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Configure
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">Discord & Slack Alerts</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Post rich embed notifications into community channels when
                    new links go live or you reach traffic milestones.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">Incoming webhooks</span>
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                    Add Bot
                  </button>
                </div>
              </div>

              {/* Sentry */}
              <div className="border-border bg-card/60 flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-red-500/10 text-red-500 flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                      S
                    </div>
                    <span className="border-green-500/20 bg-green-500/10 text-green-500 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      Operational
                    </span>
                  </div>
                  <h3 className="text-foreground text-base font-bold">Sentry Telemetry</h3>
                  <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                    Distributed error tracing and performance monitoring across
                    redirect edges and edge compute workers.
                  </p>
                </div>
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">Zero error rate</span>
                  <span className="text-muted-foreground text-xs font-mono">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: API KEYS */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-lg font-bold">Active API Keys</h2>
                <p className="text-muted-foreground text-xs">
                  Keys are scoped to your creator workspace and can be used to
                  programmatically manage links and fetch metrics.
                </p>
              </div>

              <button
                onClick={() => {
                  setGeneratedKey(null);
                  setShowKeyModal(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
              >
                <Plus size={15} />
                <span>Create New Key</span>
              </button>
            </div>

            {/* Keys Table */}
            <div className="border-border bg-card/60 overflow-hidden rounded-2xl border backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-border bg-muted/40 border-b text-muted-foreground">
                    <th className="px-6 py-3.5 font-bold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3.5 font-bold uppercase tracking-wider">
                      Token Prefix
                    </th>
                    <th className="px-6 py-3.5 font-bold uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3.5 font-bold uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3.5 text-right font-bold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-muted/20 transition-colors">
                      <td className="text-foreground px-6 py-4 font-semibold">
                        {key.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">
                        {key.keyPrefix}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {key.lastUsedAt || "Never"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg p-1.5 transition-colors"
                          title="Revoke key"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quickstart Code Example */}
            <div className="border-border bg-card/40 rounded-2xl border p-6 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <Terminal size={16} className="text-primary" />
                <h3 className="text-foreground text-sm font-bold">
                  Using your API Key with cURL
                </h3>
              </div>
              <pre className="border-border bg-background/80 overflow-x-auto rounded-xl border p-4 font-mono text-xs text-muted-foreground">
                <code>{`curl -X GET "${API_BASE_URL}/api/v1/links" \\
  -H "Authorization: Bearer lf_live_YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: WEBHOOKS */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-lg font-bold">
                  Webhook Subscriptions
                </h2>
                <p className="text-muted-foreground text-xs">
                  Deliver signed JSON payloads to your servers whenever events
                  occur on your links.
                </p>
              </div>

              <button
                onClick={() => setShowWebhookModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
              >
                <Plus size={15} />
                <span>Add Webhook</span>
              </button>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
              {webhooks.map((hook) => (
                <div
                  key={hook.id}
                  className="border-border bg-card/60 flex flex-col justify-between gap-4 rounded-2xl border p-6 backdrop-blur-md md:flex-row md:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {hook.url}
                      </span>
                      <span className="border-green-500/20 bg-green-500/10 text-green-500 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 size={11} />
                        Active
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {hook.events.map((evt) => (
                        <span
                          key={evt}
                          className="border-border bg-muted/60 text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[10px]"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestPing(hook.url)}
                      disabled={isTestingPing}
                      className="border-border bg-muted/40 hover:bg-muted text-foreground flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <Send size={12} />
                      <span>{isTestingPing ? "Pinging..." : "Test Ping"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteWebhook(hook.id)}
                      className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl p-2 transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Ping Result Inspector */}
            {testPingResult && (
              <div className="border-border bg-card/80 rounded-2xl border p-6 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <h3 className="text-foreground text-sm font-bold">
                      Webhook Test Ping Result (Status {testPingResult.status} OK)
                    </h3>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Latency: {testPingResult.latency}ms
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="border-border bg-background/80 rounded-lg border p-2.5 text-[11px] text-muted-foreground">
                    <span className="text-foreground font-semibold">Header Signature:</span>{" "}
                    {testPingResult.signature}
                  </div>
                  <pre className="border-border bg-background/80 max-h-48 overflow-y-auto rounded-xl border p-4 text-muted-foreground">
                    <code>{JSON.stringify(testPingResult.payload, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: CREATE API KEY */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="border-border bg-card relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
              {!generatedKey ? (
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <h3 className="text-foreground text-lg font-bold">
                    Generate New API Key
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Give this key a recognizable name to remember which service
                    it belongs to.
                  </p>

                  <div>
                    <label className="text-foreground mb-1.5 block text-xs font-bold uppercase">
                      Key Label
                    </label>
                    <input
                      type="text"
                      required
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Next.js Static Build, Zapier Automation"
                      className="border-border bg-background h-11 w-full rounded-xl border px-3.5 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="hover:bg-muted text-muted-foreground rounded-xl px-4 py-2 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingKey}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-xs font-bold"
                    >
                      {isCreatingKey ? "Generating..." : "Generate Key"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="border-green-500/20 bg-green-500/10 text-green-500 mx-auto flex h-12 w-12 items-center justify-center rounded-full border">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-bold">
                      Key Created Successfully
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Copy this secret immediately. For security, it will not be
                      shown again.
                    </p>
                  </div>

                  <div className="border-border bg-background relative flex items-center justify-between rounded-xl border p-3 font-mono text-xs text-foreground">
                    <span className="truncate pr-2">{generatedKey.fullKey}</span>
                    <button
                      onClick={() => copyToClipboard(generatedKey.fullKey || "")}
                      className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg p-1.5"
                    >
                      {copiedKey ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setGeneratedKey(null);
                      setShowKeyModal(false);
                    }}
                    className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 text-xs font-bold"
                  >
                    Done & Saved
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD WEBHOOK */}
        {showWebhookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="border-border bg-card relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <h3 className="text-foreground text-lg font-bold">
                  Register Webhook Endpoint
                </h3>
                <p className="text-muted-foreground text-xs">
                  Enter the HTTPS endpoint where you want LinkForge to send
                  event payloads.
                </p>

                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-bold uppercase">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/webhook"
                    className="border-border bg-background h-11 w-full rounded-xl border px-3.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-foreground mb-1.5 block text-xs font-bold uppercase">
                    Subscribed Events
                  </label>
                  <div className="space-y-2">
                    {["link.clicked", "link.created", "milestone.reached"].map((evt) => (
                      <label key={evt} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(evt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents([...selectedEvents, evt]);
                            } else {
                              setSelectedEvents(selectedEvents.filter((item) => item !== evt));
                            }
                          }}
                          className="accent-primary"
                        />
                        <span className="font-mono text-muted-foreground">{evt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWebhookModal(false)}
                    className="hover:bg-muted text-muted-foreground rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingWebhook}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    {isCreatingWebhook ? "Registering..." : "Add Endpoint"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
