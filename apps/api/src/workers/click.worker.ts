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

import crypto from "crypto";
import { Worker } from "bullmq";
import geoip from "geoip-lite";

import { prisma } from "../db/client.ts";
import { redis } from "../lib/redis.ts";

import { parseUserAgent } from "../utils/device-parser.ts";
import { parseReferrerSource } from "../utils/referrer.ts";
import { CLICK_MILESTONES } from "../utils/milestone.ts";
import { enqueueClickMilestoneEmail } from "../queues/email.queue.ts";
import { recordClickProcessed } from "../lib/metrics.ts";
import * as Sentry from "@sentry/node";
import { logger } from "../lib/logger.ts";

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
          const { linkId, socialLinkId, userId, rawReferrer, userAgent, ipAddress } = job.data;

          const source = parseReferrerSource(rawReferrer);
          const referrer = rawReferrer || "direct";
          const { device, browser } = parseUserAgent(userAgent);
          const geo = geoip.lookup(ipAddress);
          const country = geo?.country || "unknown";

          // Anonymize IP to avoid persisting raw PII
          const anonymizedIp = ipAddress
            ? crypto
                .createHash("sha256")
                .update(ipAddress + (process.env.IP_HASH_SALT || "linkforge-analytics"))
                .digest("hex")
                .slice(0, 16)
            : "unknown";

          await prisma.clickEvent.create({
            data: {
              ...(linkId ? { linkId } : {}),
              ...(socialLinkId ? { socialLinkId } : {}),
              userId,
              source,
              referrer,
              device,
              browser,
              country,
              ipAddress: anonymizedIp,
              userAgent,
            },
          });

          // 📊 Record business metric for successfully processed click
          recordClickProcessed();

          logger.info("Click tracking job completed", {
            event: "worker.click.completed",
            queue: "click-tracking",
            jobId: String(job.id),
            linkId,
            socialLinkId,
          });

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
                  logger.info("Milestone already claimed by user, skipping email", {
                    event: "worker.milestone.already_claimed",
                    queue: "click-tracking",
                    userId,
                    milestone,
                  });
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

                  logger.info("Enqueued click milestone email", {
                    event: "worker.milestone.enqueued",
                    queue: "click-tracking",
                    userId: user.id,
                    milestone,
                  });
                } else {
                  logger.warn("User not found or missing email for milestone", {
                    event: "worker.milestone.missing_user",
                    queue: "click-tracking",
                    userId,
                    milestone,
                  });
                }
              }
            }
          } catch (milestoneError) {
            logger.error("Failed to process milestones for user", {
              event: "worker.milestone.error",
              queue: "click-tracking",
              userId,
            }, milestoneError);
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
  logger.info("BullMQ click job completed", {
    event: "queue.job.completed",
    queue: "click-tracking",
    jobId: String(job.id),
  });
});

clickWorker.on("failed", (job, error) => {
  logger.error("BullMQ click job failed", {
    event: "queue.job.failed",
    queue: "click-tracking",
    jobId: job ? String(job.id) : undefined,
  }, error);
});

// 🔥 Graceful shutdown
const shutdown = async () => {
  logger.info("Closing click worker gracefully", { event: "worker.shutdown.started", queue: "click-tracking" });

  try {
    // stop taking new jobs
    // wait for active jobs
    await clickWorker.close();

    logger.info("Click worker closed gracefully", { event: "worker.shutdown.completed", queue: "click-tracking" });

    process.exit(0);
  } catch (error) {
    logger.error("Error during click worker shutdown", { event: "worker.shutdown.error", queue: "click-tracking" }, error);

    process.exit(1);
  }
};

// 🔥 Handle termination signals
process.on("SIGTERM", shutdown);

process.on("SIGINT", shutdown);
