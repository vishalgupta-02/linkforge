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
import { CLICK_MILESTONES } from "../utils/milestone.ts";
import { enqueueClickMilestoneEmail } from "../queues/email.queue.ts";

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
    return Sentry.startSpan(
      {
        name: "bullmq.click-tracking.process",
        op: "queue.process",
        attributes: {
          "queue.name": "click-tracking",
          "job.name": job.name || "click-event",
          "job.id": String(job.id),
          "job.attempt": job.attemptsMade + 1,
        },
      },
      async () => {
        try {
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

          console.log(`✅ Job ${job.id} completed (click tracked for link ${linkId})`);

          // -----------------------------------------------------------------
          // 🏆 CLICK MILESTONES DETECTION & NOTIFICATION LOGIC
          // -----------------------------------------------------------------
          try {
            const totalClicks = await prisma.clickEvent.count({
              where: { userId },
            });

            const milestone = CLICK_MILESTONES.find((m) => m === totalClicks);

            if (milestone) {
              let milestoneClaimed = false;

              try {
                await prisma.clickMilestone.create({
                  data: {
                    userId,
                    milestone,
                  },
                });
                milestoneClaimed = true;
              } catch (err: any) {
                if (err.code === "P2002") {
                  console.log(
                    `ℹ️ [ClickWorker] Milestone ${milestone} already claimed by user ${userId}. Skipping email.`,
                  );
                } else {
                  throw err;
                }
              }

              if (milestoneClaimed) {
                const user = await prisma.user.findUnique({
                  where: { id: userId },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    userName: true,
                  },
                });

                if (user?.email) {
                  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                  const dashboardUrl = `${frontendUrl.replace(/\/$/, "")}/dashboard`;

                  await enqueueClickMilestoneEmail({
                    userId: user.id,
                    userName: user.userName || user.name || "Creator",
                    email: user.email,
                    milestone,
                    totalClicks,
                    dashboardUrl,
                  });

                  console.log(
                    `📬 [ClickWorker] Enqueued click milestone (${milestone}) email for user ${user.id} (${user.email})`,
                  );
                } else {
                  console.warn(
                    `⚠️ [ClickWorker] User ${userId} not found or has no email for milestone ${milestone}`,
                  );
                }
              }
            }
          } catch (milestoneError) {
            console.error(
              `❌ [ClickWorker] Failed to process milestones for user ${userId}:`,
              milestoneError,
            );
          }
        } catch (err) {
          Sentry.withScope((scope) => {
            scope.setTag("queue.name", "click-tracking");
            scope.setTag("job.name", job.name || "click-event");
            scope.setContext("job_details", {
              jobId: job.id,
              attempt: job.attemptsMade + 1,
            });
            Sentry.captureException(err);
          });
          throw err;
        }
      },
    );
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
