import { prisma } from "../db/client.ts";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function exportClickLogs(userId: string, format: "csv" | "json") {
  const clicks = await prisma.clickEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      link: {
        select: {
          title: true,
          url: true,
          publicId: true,
        },
      },
      socialLink: {
        select: {
          platform: true,
          url: true,
          publicId: true,
        },
      },
    },
    take: 10000,
  });

  const formatted = clicks.map((c) => ({
    id: c.id,
    timestamp: c.createdAt.toISOString(),
    type: c.linkId ? "Link" : c.socialLinkId ? "Social" : "Direct",
    title: c.link?.title || c.socialLink?.platform || "Profile",
    destinationUrl: c.link?.url || c.socialLink?.url || "",
    source: c.source || "Direct",
    device: c.device || "Unknown",
    browser: c.browser || "Unknown",
    country: c.countryName || c.country || "Unknown",
    countryCode: c.countryCode || c.country || "",
    city: c.city || "Unknown",
    region: c.region || "",
    referrer: c.referrer || "Direct",
  }));

  if (format === "json") {
    return {
      contentType: "application/json",
      filename: `linkforge-analytics-${Date.now()}.json`,
      content: JSON.stringify(formatted, null, 2),
    };
  }

  const headers = [
    "Timestamp",
    "Type",
    "Title / Platform",
    "Destination URL",
    "Source",
    "Device",
    "Browser",
    "Country",
    "Country Code",
    "City",
    "Region",
    "Referrer",
  ];

  const rows = formatted.map((row) =>
    [
      escapeCsvField(row.timestamp),
      escapeCsvField(row.type),
      escapeCsvField(row.title),
      escapeCsvField(row.destinationUrl),
      escapeCsvField(row.source),
      escapeCsvField(row.device),
      escapeCsvField(row.browser),
      escapeCsvField(row.country),
      escapeCsvField(row.countryCode),
      escapeCsvField(row.city),
      escapeCsvField(row.region),
      escapeCsvField(row.referrer),
    ].join(","),
  );

  const csvContent = [headers.map(escapeCsvField).join(","), ...rows].join("\n");

  return {
    contentType: "text/csv; charset=utf-8",
    filename: `linkforge-analytics-${Date.now()}.csv`,
    content: csvContent,
  };
}

export async function exportLinksData(userId: string, format: "csv" | "json") {
  const [links, socials] = await Promise.all([
    prisma.link.findMany({
      where: { userId, deletedAt: null },
      orderBy: { position: "asc" },
      select: {
        id: true,
        publicId: true,
        title: true,
        url: true,
        counts: true,
        public: true,
        isActive: true,
        scheduledStart: true,
        scheduledEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.socialLink.findMany({
      where: { userId, deletedAt: null },
      orderBy: { position: "asc" },
      select: {
        id: true,
        publicId: true,
        platform: true,
        url: true,
        counts: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const combined = [
    ...links.map((l) => ({
      id: l.id,
      publicId: l.publicId,
      category: "standard",
      title: l.title,
      platform: "web",
      url: l.url,
      totalClicks: l.counts,
      isPublic: l.public,
      isActive: l.isActive,
      scheduledStart: l.scheduledStart ? l.scheduledStart.toISOString() : null,
      scheduledEnd: l.scheduledEnd ? l.scheduledEnd.toISOString() : null,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    ...socials.map((s) => ({
      id: s.id,
      publicId: s.publicId,
      category: "social",
      title: s.platform,
      platform: s.platform,
      url: s.url,
      totalClicks: s.counts,
      isPublic: true,
      isActive: s.isActive,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  ];

  if (format === "json") {
    return {
      contentType: "application/json",
      filename: `linkforge-links-${Date.now()}.json`,
      content: JSON.stringify(combined, null, 2),
    };
  }

  const headers = [
    "Category",
    "Title / Platform",
    "URL",
    "Public ID",
    "Total Clicks",
    "Is Public",
    "Is Active",
    "Scheduled Start",
    "Scheduled End",
    "Created At",
  ];

  const rows = combined.map((row) =>
    [
      escapeCsvField(row.category),
      escapeCsvField(row.title),
      escapeCsvField(row.url),
      escapeCsvField(row.publicId || ""),
      escapeCsvField(row.totalClicks),
      escapeCsvField(row.isPublic),
      escapeCsvField(row.isActive),
      escapeCsvField(row.scheduledStart || ""),
      escapeCsvField(row.scheduledEnd || ""),
      escapeCsvField(row.createdAt),
    ].join(","),
  );

  const csvContent = [headers.map(escapeCsvField).join(","), ...rows].join("\n");

  return {
    contentType: "text/csv; charset=utf-8",
    filename: `linkforge-links-${Date.now()}.csv`,
    content: csvContent,
  };
}
