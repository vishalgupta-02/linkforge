import { Worker, type Job, UnrecoverableError } from "bullmq";
import { redis } from "../lib/redis.ts";
import {
  EMAIL_QUEUE_NAME,
  WELCOME_EMAIL_JOB_NAME,
  PRO_UPGRADE_EMAIL_JOB_NAME,
  CLICK_MILESTONE_EMAIL_JOB_NAME,
  PASSWORD_RESET_EMAIL_JOB_NAME,
  type EmailJobData,
  type ClickMilestoneEmailJobData,
  type PasswordResetEmailJobData,
} from "../queues/email.queue.ts";
import {
  sendWelcomeEmail,
  sendProUpgradeEmail,
  sendClickMilestoneEmail,
  sendPasswordResetEmail,
} from "../services/email.service.ts";

import * as Sentry from "@sentry/node";

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    return Sentry.startSpan(
      {
        name: `bullmq.${EMAIL_QUEUE_NAME}.${job.name}`,
        op: "queue.process",
        attributes: {
          "queue.name": EMAIL_QUEUE_NAME,
          "job.name": job.name,
          "job.id": String(job.id),
          "job.attempt": job.attemptsMade + 1,
        },
      },
      async () => {
        try {
          console.log(`📦 [EmailWorker] Processing job ${job.id} (name: ${job.name})`);

          const { userId, userName, email } = job.data;

          // Validate common required fields
          if (!userId || !email) {
            console.error(
              `❌ [EmailWorker] Job ${job.id} has invalid payload: missing required fields (userId or email).`,
              { userId, email },
            );
            throw new UnrecoverableError("Invalid email job payload: missing required fields");
          }

          // Basic email format check
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            console.error(
              `❌ [EmailWorker] Job ${job.id} has invalid email format: ${email}`,
            );
            throw new UnrecoverableError(`Invalid email format: ${email}`);
          }

          if (job.name === PASSWORD_RESET_EMAIL_JOB_NAME) {
            const resetData = job.data as PasswordResetEmailJobData;

            if (!resetData.resetUrl) {
              console.error(
                `❌ [EmailWorker] Job ${job.id} missing resetUrl`,
                { userId, email },
              );
              throw new UnrecoverableError("Invalid password reset email job payload: missing resetUrl");
            }

            console.log(
              `✉️ [EmailWorker] Sending password reset email to ${email} (user: ${userId})`,
            );

            const result = await sendPasswordResetEmail({
              to: email,
              userName: userName || "Creator",
              resetUrl: resetData.resetUrl,
              expiresInMinutes: resetData.expiresInMinutes || 60,
            });

            console.log(
              `✅ [EmailWorker] Password reset email sent successfully for user ${userId} (${email}), Resend ID: ${result.id}`,
            );

            return result;
          }

          const dashboardUrl = (job.data as any).dashboardUrl;
          if (!dashboardUrl) {
            console.error(
              `❌ [EmailWorker] Job ${job.id} missing dashboardUrl for job type ${job.name}`,
              { userId, email },
            );
            throw new UnrecoverableError(`Invalid email job payload: missing dashboardUrl for ${job.name}`);
          }

          if (job.name === CLICK_MILESTONE_EMAIL_JOB_NAME) {
            const milestoneData = job.data as ClickMilestoneEmailJobData;

            if (!milestoneData.milestone || typeof milestoneData.totalClicks !== "number") {
              console.error(
                `❌ [EmailWorker] Job ${job.id} has invalid milestone data:`,
                milestoneData,
              );
              throw new UnrecoverableError("Invalid click milestone email job payload");
            }

            console.log(
              `✉️ [EmailWorker] Sending click milestone (${milestoneData.milestone}) email to ${email} (user: ${userId})`,
            );

            const result = await sendClickMilestoneEmail({
              to: email,
              userName: userName || "Creator",
              milestone: milestoneData.milestone,
              totalClicks: milestoneData.totalClicks,
              dashboardUrl,
            });

            console.log(
              `✅ [EmailWorker] Click milestone (${milestoneData.milestone}) email sent successfully for user ${userId} (${email}), Resend ID: ${result.id}`,
            );

            return result;
          }

          if (job.name === PRO_UPGRADE_EMAIL_JOB_NAME) {
            console.log(
              `✉️ [EmailWorker] Sending Pro upgrade email to ${email} (user: ${userId}, name: ${userName || "Creator"})`,
            );

            const result = await sendProUpgradeEmail({
              to: email,
              userName: userName || "Creator",
              dashboardUrl,
            });

            console.log(
              `✅ [EmailWorker] Pro upgrade email sent successfully for user ${userId} (${email}), Resend ID: ${result.id}`,
            );

            return result;
          }

          if (job.name === WELCOME_EMAIL_JOB_NAME) {
            console.log(
              `✉️ [EmailWorker] Sending welcome email to ${email} (user: ${userId}, name: ${userName || "Creator"})`,
            );

            const result = await sendWelcomeEmail({
              to: email,
              userName: userName || "Creator",
              dashboardUrl,
            });

            console.log(
              `✅ [EmailWorker] Welcome email sent successfully for user ${userId} (${email}), Resend ID: ${result.id}`,
            );

            return result;
          }

          console.warn(`⚠️ [EmailWorker] Unrecognized job name: ${job.name} (jobId: ${job.id})`);
          throw new UnrecoverableError(`Unrecognized email job name: ${job.name}`);
        } catch (err) {
          Sentry.withScope((scope) => {
            scope.setTag("queue.name", EMAIL_QUEUE_NAME);
            scope.setTag("job.name", job.name);
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
    concurrency: 10,
  },
);

// Worker lifecycle event listeners
emailWorker.on("completed", (job) => {
  console.log(`🎉 [EmailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `❌ [EmailWorker] Job ${job?.id} failed with error:`,
    error.message || error,
  );
});

// Graceful shutdown handler
const shutdownEmailWorker = async () => {
  console.log("🛑 SIGTERM/SIGINT received. Closing email worker...");
  try {
    await emailWorker.close();
    console.log("✅ Email worker closed gracefully");
  } catch (error) {
    console.error("❌ Error during email worker shutdown:", error);
  }
};

process.on("SIGTERM", shutdownEmailWorker);
process.on("SIGINT", shutdownEmailWorker);
