import { prisma } from "../db/client.ts";
import { CACHE_KEYS } from "../lib/cache-keys.ts";
import { redis } from "../lib/redis.ts";
import { countryCodeToFlag } from "../utils/country.ts";

const getAnalyticsTTL = (plan: "FREE" | "PRO") => {
  return plan === "PRO" ? 10 : 60;
};

const getDateRanges = () => {
  const now = new Date();
  const days90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const days7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return { days90, days30, days7, now };
};

const getClicksForPeriod = async (userId: string, startDate: Date) => {
  return prisma.clickEvent.count({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
  });
};

const getClicksByDayForRange = async (
  userId: string,
  startDate: Date,
  numDays: number,
): Promise<Array<{ date: string; clicks: number }>> => {
  const clicks = await prisma.clickEvent.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const grouped: Record<string, number> = {};

  for (const click of clicks) {
    const [day] = click.createdAt.toISOString().split("T");

    if (!day) {
      continue;
    }

    grouped[day] = (grouped[day] || 0) + 1;
  }

  const result: Array<{ date: string; clicks: number }> = [];
  const now = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const [dateStr] = d.toISOString().split("T");

    if (dateStr) {
      result.push({
        date: dateStr,
        clicks: grouped[dateStr] || 0,
      });
    }
  }

  return result;
};

const isIpAddress = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed === "localhost") {
    return true;
  }

  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(
    trimmed,
  );
};

const normalizeSourceLabel = (source?: string | null) => {
  if (!source) {
    return "Other";
  }

  if (isIpAddress(source)) {
    return "Other";
  }

  return source;
};

export const getDashboardAnalytics = async (
  userId: string,
  plan: "FREE" | "PRO",
  range?: string,
) => {
  const cacheKey = `${CACHE_KEYS.analytics(userId)}:${range || "all"}`;

  const cached = await redis.get(cacheKey);

  if (cached) {

    return JSON.parse(cached);
  }

  const start = performance.now();

  const { days90, days30, days7 } = getDateRanges();

  const shouldFetch7d = !range || range === "7d";
  const shouldFetch30d = !range || range === "30d";
  const shouldFetch90d = !range || range === "90d";

  const [
    totalClicks,
    clicks7d,
    clicks30d,
    clicks90d,
    clicksByCountry,
    clicksByDevice,
    clicksByLink,
    clicksBySocial,
    clicksBySource,
    clicksByDayArray7d,
    clicksByDayArray30d,
    clicksByDayArray90d,
  ] = await Promise.all([
    prisma.clickEvent.count({
      where: { userId },
    }),

    shouldFetch7d ? getClicksForPeriod(userId, days7) : Promise.resolve(0),

    shouldFetch30d ? getClicksForPeriod(userId, days30) : Promise.resolve(0),

    shouldFetch90d ? getClicksForPeriod(userId, days90) : Promise.resolve(0),

    prisma.clickEvent.groupBy({
      by: ["countryCode", "countryName"],
      where: {
        userId,
      },
      _count: {
        countryCode: true,
      },
    }),

    prisma.clickEvent.groupBy({
      by: ["device"],
      where: {
        userId,
      },
      _count: {
        device: true,
      },
      orderBy: {
        _count: {
          device: "desc",
        },
      },
    }),

    prisma.clickEvent.groupBy({
      by: ["linkId"],
      where: {
        userId,
        linkId: { not: null },
      },
      _count: {
        linkId: true,
      },
    }),

    prisma.clickEvent.groupBy({
      by: ["socialLinkId"],
      where: {
        userId,
        socialLinkId: { not: null },
      },
      _count: {
        socialLinkId: true,
      },
    }),

    prisma.clickEvent.groupBy({
      by: ["source"],
      where: {
        userId,
      },
      _count: {
        source: true,
      },
      orderBy: {
        _count: {
          source: "desc",
        },
      },
    }),

    shouldFetch7d
      ? getClicksByDayForRange(userId, days7, 7)
      : Promise.resolve([]),

    shouldFetch30d
      ? getClicksByDayForRange(userId, days30, 30)
      : Promise.resolve([]),

    shouldFetch90d
      ? getClicksByDayForRange(userId, days90, 90)
      : Promise.resolve([]),

  ]);

  const linkIds = clicksByLink.map((item) => item.linkId).filter(Boolean) as string[];
  const links = await prisma.link.findMany({
    where: {
      id: {
        in: linkIds,
      },
    },
    select: {
      id: true,
      title: true,
      url: true,
    },
  });

  const maxClicks = clicksByLink[0]?._count.linkId || 1;

  const enrichedClicksByLink = clicksByLink
    .map((item) => {
      const link = links.find((l) => l.id === item.linkId);

      const clicks = item._count.linkId;

      return {
        linkId: item.linkId,

        title: link?.title || "Untitled",

        url: link?.url || "",

        clicks,

        percentage:
          totalClicks > 0
            ? Number(((clicks / totalClicks) * 100).toFixed(1))
            : 0,

        relativeWidth: (clicks / maxClicks) * 100,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const socialLinkIds = clicksBySocial
    .map((item) => item.socialLinkId)
    .filter(Boolean) as string[];

  const socials = await prisma.socialLink.findMany({
    where: {
      id: {
        in: socialLinkIds,
      },
    },
    select: {
      id: true,
      platform: true,
      url: true,
    },
  });

  const totalSocialClicks = clicksBySocial.reduce(
    (sum, item) => sum + item._count.socialLinkId,
    0,
  );

  const maxSocialClicks = clicksBySocial[0]?._count.socialLinkId || 1;

  const enrichedClicksBySocial = clicksBySocial
    .map((item) => {
      const social = socials.find((s) => s.id === item.socialLinkId);
      const clicks = item._count.socialLinkId;

      return {
        socialLinkId: item.socialLinkId!,
        platform: social?.platform || "custom",
        url: social?.url || "",
        clicks,
        percentage:
          totalSocialClicks > 0
            ? Number(((clicks / totalSocialClicks) * 100).toFixed(1))
            : 0,
        relativeWidth: (clicks / maxSocialClicks) * 100,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const topSocial = enrichedClicksBySocial[0] || null;

  const socialAnalytics = {
    totalSocialClicks,
    topSocial,
    clicksBySocial: enrichedClicksBySocial,
  };

  const clicksByDay: Record<string, number> = {};

  if (shouldFetch7d) clicksByDay["7d"] = clicks7d;
  if (shouldFetch30d) clicksByDay["30d"] = clicks30d;
  if (shouldFetch90d) clicksByDay["90d"] = clicks90d;

  let clicksByDayArray: Array<{ date: string; clicks: number }> = [];

  if (range === "7d") {
    clicksByDayArray = clicksByDayArray7d;
  } else if (range === "30d") {
    clicksByDayArray = clicksByDayArray30d;
  } else if (range === "90d") {
    clicksByDayArray = clicksByDayArray90d;
  } else {

    clicksByDayArray = clicksByDayArray30d;
  }

  const enrichedCountries = clicksByCountry
    .map((item) => {
      const clicks = item._count.countryCode; 

      return {
        countryCode: item.countryCode,

        countryName: item.countryName,

        flag: countryCodeToFlag(item.countryCode),

        clicks,

        percentage:
          totalClicks > 0
            ? Number(((clicks / totalClicks) * 100).toFixed(1))
            : 0,
      };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const maxSourceClicks = clicksBySource[0]?._count.source || 1;

  const enrichedSources = clicksBySource
    .map((item) => {
      const clicks = item._count.source;

      return {
        source: normalizeSourceLabel(item.source),

        clicks,

        percentage:
          totalClicks > 0
            ? Number(((clicks / totalClicks) * 100).toFixed(1))
            : 0,

        relativeWidth: (clicks / maxSourceClicks) * 100,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const analytics = {
    totalClicks,
    clicksByDay,
    clicksByDayArray,
    clicksByCountry: enrichedCountries,
    clicksByDevice,
    clicksByLink: enrichedClicksByLink,
    clicksBySource: enrichedSources,
    socialAnalytics,
  };

  await redis.set(
    cacheKey,
    JSON.stringify(analytics),
    "EX",
    getAnalyticsTTL(plan),
  );

  return analytics;
};
