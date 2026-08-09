"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  MousePointerClick,
  Eye,
  Activity,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Globe,
  ExternalLink,
} from "lucide-react";
import { getAnalytics, type AnalyticsResponse } from "@/apis/get-analytics";
import { useRouter } from "next/navigation";

const calculateChartHeights = (
  dailyData?: Array<{ date: string; clicks: number }>,
) => {
  if (!dailyData || dailyData.length === 0) {
    return [];
  }

  const maxClicks = Math.max(...dailyData.map((d) => d.clicks), 1);
  return dailyData.map((d) => (d.clicks / maxClicks) * 100);
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const chartHeights = useMemo(
    () => calculateChartHeights(analytics?.clicksByDayArray),
    [analytics?.clicksByDayArray],
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      console.log("🔄 Fetching analytics for range:", timeRange);
      const data = await getAnalytics(
        timeRange as "7d" | "30d" | "90d" | undefined,
      );
      console.log("✅ Analytics data loaded:", data);
      setAnalytics(data);
      setLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-4 md:py-4">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-foreground text-xl font-semibold tracking-tight">
                Analytics
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Track how your links are performing.
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  Last {timeRange}
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {isDropdownOpen && (
                <div className="border-border bg-background animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-10 mt-1 w-full overflow-hidden rounded-lg border shadow-md duration-200">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setIsDropdownOpen(false);
                      }}
                      className="text-foreground hover:bg-muted flex w-full items-center px-3 py-2 text-sm transition-colors"
                    >
                      {range === "7d" && "Last 7 Days"}
                      {range === "30d" && "Last 30 Days"}
                      {range === "90d" && "Last 90 Days"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>
          {analytics && analytics.totalClicks > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <Eye size={12} /> Total Clicks
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {loading
                      ? "..."
                      : (analytics?.totalClicks || 0).toLocaleString()}
                  </h3>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <ArrowUpRight size={12} className="text-green-500" />{" "}
                    Updated now
                  </p>
                </div>
                <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <MousePointerClick size={12} /> Clicks (Current Period)
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {loading
                      ? "..."
                      : (
                          analytics?.clicksByDay?.[
                            timeRange as "7d" | "30d" | "90d"
                          ] || 0
                        ).toLocaleString()}
                  </h3>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    Last {timeRange}
                  </p>
                </div>
                <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <Globe size={12} /> Top Country
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {loading
                      ? "..."
                      : analytics?.clicksByCountry?.[0]?.country || "N/A"}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {loading
                      ? "..."
                      : `${analytics?.clicksByCountry?.[0]?.flag || ""} ${analytics?.clicksByCountry?.[0]?.clicks || 0} clicks`}
                  </p>
                </div>
                <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
                  <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
                    <Activity size={12} /> Top Device
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {loading
                      ? "..."
                      : analytics?.clicksByDevice?.[0]?.device || "N/A"}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {loading
                      ? "..."
                      : `${analytics?.clicksByDevice?.[0]?._count.device || 0} clicks`}
                  </p>
                </div>
              </div>
              <div className="border-border bg-background rounded-xl border p-6 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-foreground text-sm font-medium">
                    Traffic Overview
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="text-foreground flex items-center gap-1.5">
                      <div className="bg-foreground h-2 w-2 rounded-full" />{" "}
                      Clicks
                    </span>
                  </div>
                </div>

                <div className="relative flex h-64 w-full items-end justify-between gap-1 sm:gap-1.5">
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="border-border/50 h-0 w-full border-t"
                      />
                    ))}
                  </div>

                  {loading ? (
                    <div className="text-muted-foreground z-10 flex w-full items-center justify-center">
                      Loading chart...
                    </div>
                  ) : chartHeights.length > 0 ? (
                    chartHeights.map((height, i) => (
                      <div
                        key={i}
                        className="group relative z-10 flex h-full flex-1 flex-col justify-end gap-1"
                        title={`${analytics?.clicksByDayArray?.[i]?.date || `Day ${i + 1}`}: ${analytics?.clicksByDayArray?.[i]?.clicks || 0} clicks`}
                      >
                        <div
                          className="bg-foreground group-hover:bg-foreground/80 w-full rounded-t-sm transition-all duration-300"
                          style={{ height: `${Math.max(height, 5)}%` }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground z-10 flex w-full items-center justify-center">
                      No daily data available yet
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-4">
                  <h3 className="text-foreground px-1 text-sm font-medium">
                    Top Countries
                  </h3>
                  <div className="border-border bg-background divide-border h-80 divide-y overflow-y-auto rounded-xl border shadow-sm">
                    {loading ? (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        Loading...
                      </div>
                    ) : analytics?.clicksByCountry &&
                      analytics.clicksByCountry.length > 0 ? (
                      analytics.clicksByCountry
                        .slice(0, 5)
                        .map((country, i) => (
                          // <div
                          //   key={i}
                          //   className="flex min-h-10 items-center justify-between p-3"
                          // >
                          //   <span className="text-foreground truncate text-sm">
                          //     {country.country || "Unknown"}
                          //   </span>
                          //   <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                          //     {country._count.country}
                          //   </span>
                          // </div>
                          <div
                            key={country.countryCode}
                            className="flex min-h-10 flex-col items-center justify-between space-y-2 p-3"
                          >
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{country.flag}</span>

                                <span className="font-medium">
                                  {country.countryName}
                                </span>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">
                                  {country.clicks}
                                </p>

                                <p className="text-muted-foreground text-xs">
                                  {country.percentage}%
                                </p>
                              </div>
                            </div>

                            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                              <div
                                className="bg-foreground h-full rounded-full"
                                style={{
                                  width: `${country.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        No country data yet
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-foreground px-1 text-sm font-medium">
                    Top Sources
                  </h3>
                  <div className="border-border bg-background divide-border h-80 divide-y overflow-y-auto rounded-xl border shadow-sm">
                    {loading ? (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        Loading...
                      </div>
                    ) : analytics?.clicksBySource &&
                      analytics.clicksBySource.length > 0 ? (
                      analytics.clicksBySource.slice(0, 5).map((source, i) => (
                        <div
                          key={`${source.source}-${i}`}
                          className="flex min-h-10 flex-col justify-between gap-2 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-foreground truncate text-sm font-medium">
                              {source.source}
                            </span>
                            <div className="text-right">
                              <p className="font-semibold">{source.clicks}</p>
                              <p className="text-muted-foreground text-xs">
                                {source.percentage}%
                              </p>
                            </div>
                          </div>

                          <div className="bg-muted h-2 overflow-hidden rounded-full">
                            <div
                              className="bg-foreground h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${source.relativeWidth}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        No source data yet
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-foreground px-1 text-sm font-medium">
                    Top Performing Links
                  </h3>
                  <div className="border-border bg-background divide-border h-80 divide-y overflow-y-auto rounded-xl border shadow-sm">
                    {loading ? (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        Loading...
                      </div>
                    ) : analytics?.clicksByLink &&
                      analytics.clicksByLink.length > 0 ? (
                      analytics.clicksByLink.slice(0, 4).map((link, i) => (
                        <div
                          key={i}
                          className="group hover:bg-muted/30 flex min-h-16 items-center justify-between p-4 transition-colors"
                        >
                          {/* <div className="min-w-0 flex-1 pr-4">
                            <p className="text-foreground truncate text-sm font-medium">
                              {link.title}
                            </p>
                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                              {link.url}
                            </p>
                          </div> */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{link.title}</p>

                                <p className="text-muted-foreground text-xs">
                                  {link.url}
                                </p>
                              </div>
                            </div>

                            <div className="bg-muted h-2 overflow-hidden rounded-full">
                              <div
                                className="bg-foreground h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${link.relativeWidth}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {/* <span className="text-foreground text-sm font-semibold">
                              {link.clicks.toLocaleString()}
                            </span> */}
                            <div className="space-y-3 text-right">
                              <p className="font-semibold">{link.clicks}</p>

                              <p className="text-muted-foreground text-xs font-semibold">
                                {link.percentage}%
                              </p>
                            </div>
                            <a
                              href={
                                link.url.startsWith("http")
                                  ? link.url
                                  : `https://${link.url}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        No link clicks yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-foreground px-1 text-sm font-medium">
                    Top Devices
                  </h3>
                  <div className="border-border bg-background divide-border h-80 divide-y overflow-y-auto rounded-xl border shadow-sm">
                    {loading ? (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        Loading...
                      </div>
                    ) : analytics?.clicksByDevice &&
                      analytics.clicksByDevice.length > 0 ? (
                      analytics.clicksByDevice.slice(0, 5).map((device, i) => (
                        <div
                          key={i}
                          className="flex min-h-10 items-center justify-between p-3"
                        >
                          <span className="text-foreground truncate text-sm">
                            {device.device || "Unknown"}
                          </span>
                          <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                            {device._count.device}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground p-4 text-center text-sm">
                        No device data yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {!loading && (!analytics || analytics.totalClicks === 0) && (
            <div className="border-border bg-background flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-sm">
              <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <BarChart3 size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-foreground mb-1.5 text-base font-medium">
                No analytics data yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                Share your page with your audience to start tracking views and
                clicks.
              </p>
              <button
                className="bg-primary text-primary-foreground inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium shadow-sm transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
                onClick={() => router.push("/public-profile")}
              >
                View public page
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
