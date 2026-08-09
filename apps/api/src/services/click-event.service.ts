// import type { Request } from "express";
// import { getDeviceType } from "../utils/device-parser.ts";
// import { prisma } from "../db/client.ts";

// type TrackClickInput = {
//   linkId: string;
//   userId: string;
//   req: Request;
// };

// export const trackClickEvent = async ({
//   linkId,
//   userId,
//   req,
// }: TrackClickInput) => {
//   try {
//     // 🔍 Referrer
//     const referrer = req.headers.referer || req.headers.referrer || "direct";

//     // 🔍 Device
//     const userAgent = req.headers["user-agent"];
//     const device = getDeviceType(
//       typeof userAgent === "string" ? userAgent : "",
//     );

//     // 🌍 Country (depends on infra)
//     const country =
//       (req.headers["x-vercel-ip-country"] as string) ||
//       (req.headers["cf-ipcountry"] as string) ||
//       "unknown";

//     await prisma.clickEvent.create({
//       data: {
//         linkId,
//         userId,
//         device,
//         country,
//         referrer: String(referrer),
//       },
//     });
//   } catch (error) {
//     console.error("Click tracking failed:", error);
//   }
// };

// services/click-event.service.ts;

// type TrackClickInput = {
//   linkId: string;
//   userId: string;
//   req: Request;
// };

// export const trackClickEvent = async ({
//   linkId,
//   userId,
//   req,
// }: TrackClickInput) => {
//   const referrer = req.headers.referer || req.headers.referrer || "direct";

//   const userAgent = req.headers["user-agent"];

//   const device = getDeviceType(typeof userAgent === "string" ? userAgent : "");

//   const country =
//     (req.headers["x-vercel-ip-country"] as string) ||
//     (req.headers["cf-ipcountry"] as string) ||
//     "unknown";

//   const ipAddress =
//     (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
//     req.ip ||
//     "unknown";

//   const userAgentString = typeof userAgent === "string" ? userAgent : "";

//   await prisma.clickEvent.create({
//     data: {
//       linkId,
//       userId,
//       device,
//       country,
//       referrer: String(referrer),
//       ipAddress,
//       userAgent: userAgentString,
//     },
//   });
// };

import type { Request } from "express";
// import geoip from "geoip-lite";

// import { prisma } from "../db/client.ts";
// import { parseUserAgent } from "../utils/device-parser.ts";
// import { parseReferrerSource } from "../utils/referrer.ts";
import { clickQueue } from "../queues/click.queue.ts";

type TrackClickInput = {
  linkId: string;
  userId: string;
  req: Request;
};

// export const recordClickEvent = async ({
//   linkId,
//   userId,
//   req,
// }: TrackClickInput) => {
//   // 🔗 Referrer
//   const referrer = req.headers.referer || req.headers.referrer || "direct";

//   // 🌐 User agent
//   const userAgent =
//     typeof req.headers["user-agent"] === "string"
//       ? req.headers["user-agent"]
//       : "";

//   // 📱 Device + Browser
//   const { device, browser } = parseUserAgent(userAgent);

//   // 🌍 IP
//   const ipAddress =
//     (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
//     req.ip ||
//     "127.0.0.1";

//   // 🌍 Geo lookup
//   const geo = geoip.lookup(ipAddress);

//   const country = geo?.country || "unknown";

//   // 💾 Store event
//   await prisma.clickEvent.create({
//     data: {
//       linkId,
//       userId,
//       device,
//       browser,
//       country,
//       referrer: String(referrer),
//       ipAddress,
//       userAgent,
//     },
//   });
// };

// ================================== Commented for refactor to queue/worker system =================================

// export const recordClickEvent = async ({
//   linkId,
//   userId,
//   req,
// }: TrackClickInput) => {
//   // 🔗 Raw referrer
//   const rawReferrer =
//     typeof req.headers.referer === "string" ? req.headers.referer : undefined;

//   const referrer = rawReferrer || "direct";

//   // 🔥 Clean source
//   const source = parseReferrerSource(rawReferrer);

//   // 🌐 User agent
//   const userAgent =
//     typeof req.headers["user-agent"] === "string"
//       ? req.headers["user-agent"]
//       : "";

//   // 📱 Device + Browser
//   const { device, browser } = parseUserAgent(userAgent);

//   // 🌍 IP
//   const ipAddress =
//     (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
//     req.ip ||
//     "127.0.0.1";

//   // 🌍 Country
//   const geo = geoip.lookup(ipAddress);

//   const country = geo?.country || "unknown";

//   // 💾 Store event
//   await prisma.clickEvent.create({
//     data: {
//       linkId,
//       userId,

//       source,
//       referrer,

//       device,
//       browser,
//       country,

//       ipAddress,
//       userAgent,
//     },
//   });
// };

// ================================== Refactored to use BullMQ queue and worker ===================================

// export const enqueueClickEvent = async ({
//   linkId,
//   userId,
//   req,
// }: TrackClickInput) => {
//   const userAgent =
//     typeof req.headers["user-agent"] === "string"
//       ? req.headers["user-agent"]
//       : "";

//   const ipAddress =
//     (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
//     req.ip ||
//     "127.0.0.1";

//   const referrer =
//     typeof req.headers.referer === "string" ? req.headers.referer : "";

//   await clickQueue.add(
//     "track-click",

//     {
//       linkId,
//       userId,
//       ipAddress,
//       userAgent,
//       referrer,
//     },
//   );
// };

// ================================= BullMQ with retries and backoff =================================

export const enqueueClickEvent = async ({
  linkId,
  userId,
  req,
}: TrackClickInput) => {
  const rawReferrer =
    typeof req.headers.referer === "string" ? req.headers.referer : undefined;

  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : "";

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "127.0.0.1";

  await clickQueue.add(
    "track-click",

    {
      linkId,
      userId,

      rawReferrer,
      userAgent,
      ipAddress,
    },

    {
      // 🔥 retry 3 times
      attempts: 3,

      // 🔥 exponential backoff
      backoff: {
        type: "exponential",

        // initial delay
        delay: 1000,
      },

      removeOnComplete: 1000,

      removeOnFail: 5000,
    },
  );
};
