// import { Worker } from "bullmq";
// import geoip from "geoip-lite";

// import { prisma } from "../db/client.ts";
// import { redis } from "../lib/redis.ts";

// import { parseUserAgent } from "../utils/device-parser.ts";
// import { parseReferrerSource } from "../utils/referrer.ts";

// export const clickWorker = new Worker(
//   "click-tracking",

//   async (job) => {
//     console.log(`📦 Processing job ${job.id}`);

//     const { linkId, userId, ipAddress, userAgent, referrer } = job.data;

//     const { device, browser } = parseUserAgent(userAgent);

//     const source = parseReferrerSource(referrer);

//     const geo = geoip.lookup(ipAddress);

//     const country = geo?.country || "unknown";

//     await prisma.clickEvent.create({
//       data: {
//         linkId,
//         userId,

//         device,
//         browser,
//         source,
//         country,

//         ipAddress,
//         userAgent,
//       },
//     });

//     console.log(`✅ Job ${job.id} completed`);
//   },

//   {
//     connection: redis,
//   },
// );

import { Worker } from "bullmq";
import geoip from "geoip-lite";

import { prisma } from "../db/client.ts";
import { redis } from "../lib/redis.ts";

import { parseUserAgent } from "../utils/device-parser.ts";
import { parseReferrerSource } from "../utils/referrer.ts";

// export const clickWorker = new Worker(
//   "click-tracking",

//   async (job) => {
//     const { linkId, userId, rawReferrer, userAgent, ipAddress } = job.data;

//     // 🔥 Parse source
//     const source = parseReferrerSource(rawReferrer);

//     const referrer = rawReferrer || "direct";

//     // 🔥 Parse browser/device
//     const { device, browser } = parseUserAgent(userAgent);

//     // 🔥 Geo lookup
//     const geo = geoip.lookup(ipAddress);

//     const country = geo?.country || "unknown";

//     // 🔥 Persist
//     await prisma.clickEvent.create({
//       data: {
//         linkId,
//         userId,

//         source,
//         referrer,

//         device,
//         browser,
//         country,

//         ipAddress,
//         userAgent,
//       },
//     });

//     console.log(`✅ Click tracked for ${linkId}`);
//   },

//   {
//     connection: redis,
//   },
// );

// ================================== Refactored with enhanced logging and graceful shutdown ==================================

export const clickWorker = new Worker(
  "click-tracking",

  async (job) => {
    const { linkId, userId, rawReferrer, userAgent, ipAddress } = job.data;

    const source = parseReferrerSource(rawReferrer);

    const referrer = rawReferrer || "direct";

    const { device, browser } = parseUserAgent(userAgent);

    const geo = geoip.lookup(ipAddress);

    const country = geo?.country || "unknown";

    await prisma.clickEvent.create({
      data: {
        linkId,
        userId,

        source,
        referrer,

        device,
        browser,
        country,

        ipAddress,
        userAgent,
      },
    });

    console.log(`✅ Job ${job.id} completed`);
  },

  {
    connection: redis,

    concurrency: 20,
  },
);

// 🔥 Worker events
clickWorker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

clickWorker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} failed`, error);
});

// 🔥 Graceful shutdown
const shutdown = async () => {
  console.log("🛑 SIGTERM received. Closing worker...");

  try {
    // stop taking new jobs
    // wait for active jobs
    await clickWorker.close();

    console.log("✅ Worker closed gracefully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown", error);

    process.exit(1);
  }
};

// 🔥 Handle termination signals
process.on("SIGTERM", shutdown);

process.on("SIGINT", shutdown);
