import { Worker, type Job, UnrecoverableError } from "bullmq";
import { redis } from "../lib/redis.ts";
import {
  EMAIL_QUEUE_NAME,
  WELCOME_EMAIL_JOB_NAME,
  PRO_UPGRADE_EMAIL_JOB_NAME,
  CLICK_MILESTONE_EMAIL_JOB_NAME,
  PASSWORD_RESET_EMAIL_JOB_NAME,
  VERIFICATION_EMAIL_JOB_NAME,
  FEEDBACK_EMAIL_JOB_NAME,
  type EmailJobData,
  type ClickMilestoneEmailJobData,
  type PasswordResetEmailJobData,
  type VerificationEmailJobData,
  type FeedbackEmailJobData,
} from "../queues/email.queue.ts";
import {
  sendWelcomeEmail,
  sendProUpgradeEmail,
  sendClickMilestoneEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendFeedbackEmail,
} from "../services/email.service.ts";
import * as Sentry from "@sentry/node";
import { logger } from "../lib/logger.ts";

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
          logger.info("Processing email job", {
            event: "worker.email.processing",
            queue: EMAIL_QUEUE_NAME,
            jobName: job.name,
            jobId: String(job.id),
          });

          if (job.name === FEEDBACK_EMAIL_JOB_NAME) {
            const feedbackData = job.data as FeedbackEmailJobData;

            if (!feedbackData.fromEmail || !feedbackData.message) {
              logger.error(
                "Job has invalid feedback payload: missing fromEmail or message",
                { event: "worker.email.invalid_feedback_payload", queue: EMAIL_QUEUE_NAME, jobId: String(job.id) },
              );
              throw new UnrecoverableError("Invalid feedback email job payload: missing fromEmail or message");
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(feedbackData.fromEmail)) {
              logger.error(
                "Job has invalid fromEmail format",
                { event: "worker.email.invalid_email", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), fromEmail: feedbackData.fromEmail },
              );
              throw new UnrecoverableError(`Invalid fromEmail format: ${feedbackData.fromEmail}`);
            }

            logger.info("Sending feedback email to recipient", {
              event: "worker.email.send_feedback",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              fromEmail: feedbackData.fromEmail,
              targetEmail: feedbackData.targetEmail || "abhimanyug987@gmail.com",
            });

            const result = await sendFeedbackEmail({
              targetEmail: feedbackData.targetEmail || "abhimanyug987@gmail.com",
              fromEmail: feedbackData.fromEmail,
              name: feedbackData.name,
              category: feedbackData.category,
              rating: feedbackData.rating,
              message: feedbackData.message,
              userId: feedbackData.userId,
            });

            logger.info("Feedback email sent successfully", {
              event: "worker.email.feedback_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              resendId: result.id,
            });

            return result;
          }

          const { userId, userName, email } = job.data as any;

          if (!userId || !email) {
            logger.error(
              "Job has invalid payload: missing required fields",
              { event: "worker.email.invalid_payload", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), userId, email },
            );
            throw new UnrecoverableError("Invalid email job payload: missing required fields");
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            logger.error(
              "Job has invalid email format",
              { event: "worker.email.invalid_email", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), email },
            );
            throw new UnrecoverableError(`Invalid email format: ${email}`);
          }

          if (job.name === VERIFICATION_EMAIL_JOB_NAME) {
            const verificationData = job.data as VerificationEmailJobData;

            if (!verificationData.verificationUrl) {
              logger.error(
                "Job missing verificationUrl",
                { event: "worker.email.missing_verification_url", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), userId, email },
              );
              throw new UnrecoverableError("Invalid verification email job payload: missing verificationUrl");
            }

            logger.info("Sending email verification email", {
              event: "worker.email.send_verification",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
            });

            const result = await sendVerificationEmail({
              to: email,
              userName: userName || "Creator",
              verificationUrl: verificationData.verificationUrl,
            });

            logger.info("Email verification email sent successfully", {
              event: "worker.email.verification_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              resendId: result.id,
            });

            return result;
          }

          if (job.name === PASSWORD_RESET_EMAIL_JOB_NAME) {
            const resetData = job.data as PasswordResetEmailJobData;

            if (!resetData.resetUrl) {
              logger.error(
                "Job missing resetUrl",
                { event: "worker.email.missing_reset_url", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), userId, email },
              );
              throw new UnrecoverableError("Invalid password reset email job payload: missing resetUrl");
            }

            logger.info("Sending password reset email", {
              event: "worker.email.send_password_reset",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
            });

            const result = await sendPasswordResetEmail({
              to: email,
              userName: userName || "Creator",
              resetUrl: resetData.resetUrl,
              expiresInMinutes: resetData.expiresInMinutes || 60,
            });

            logger.info("Password reset email sent successfully", {
              event: "worker.email.password_reset_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              resendId: result.id,
            });

            return result;
          }

          const dashboardUrl = (job.data as any).dashboardUrl;
          if (!dashboardUrl) {
            logger.error(
              "Job missing dashboardUrl",
              { event: "worker.email.missing_dashboard_url", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), jobName: job.name, userId, email },
            );
            throw new UnrecoverableError(`Invalid email job payload: missing dashboardUrl for ${job.name}`);
          }

          if (job.name === CLICK_MILESTONE_EMAIL_JOB_NAME) {
            const milestoneData = job.data as ClickMilestoneEmailJobData;

            if (!milestoneData.milestone || typeof milestoneData.totalClicks !== "number") {
              logger.error(
                "Job has invalid milestone data",
                { event: "worker.email.invalid_milestone_data", queue: EMAIL_QUEUE_NAME, jobId: String(job.id), milestone: milestoneData.milestone, totalClicks: milestoneData.totalClicks },
              );
              throw new UnrecoverableError("Invalid click milestone email job payload");
            }

            logger.info("Sending click milestone email", {
              event: "worker.email.send_milestone",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              milestone: milestoneData.milestone,
            });

            const result = await sendClickMilestoneEmail({
              to: email,
              userName: userName || "Creator",
              milestone: milestoneData.milestone,
              totalClicks: milestoneData.totalClicks,
              dashboardUrl,
            });

            logger.info("Click milestone email sent successfully", {
              event: "worker.email.milestone_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              resendId: result.id,
            });

            return result;
          }

          if (job.name === PRO_UPGRADE_EMAIL_JOB_NAME) {
            logger.info("Sending Pro upgrade email", {
              event: "worker.email.send_pro_upgrade",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
            });

            const result = await sendProUpgradeEmail({
              to: email,
              userName: userName || "Creator",
              dashboardUrl,
            });

            logger.info("Pro upgrade email sent successfully", {
              event: "worker.email.pro_upgrade_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              resendId: result.id,
            });

            return result;
          }

          if (job.name === WELCOME_EMAIL_JOB_NAME) {
            logger.info("Sending welcome email", {
              event: "worker.email.send_welcome",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
            });

            const result = await sendWelcomeEmail({
              to: email,
              userName: userName || "Creator",
              dashboardUrl,
            });

            logger.info("Welcome email sent successfully", {
              event: "worker.email.welcome_sent",
              queue: EMAIL_QUEUE_NAME,
              jobId: String(job.id),
              userId,
              email,
              resendId: result.id,
            });

            return result;
          }

          logger.warn("Unrecognized job name", {
            event: "worker.email.unrecognized_job",
            queue: EMAIL_QUEUE_NAME,
            jobName: job.name,
            jobId: String(job.id),
          });
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

emailWorker.on("completed", (job) => {
  logger.info("Email job completed successfully", {
    event: "queue.job.completed",
    queue: EMAIL_QUEUE_NAME,
    jobId: String(job.id),
  });
});

emailWorker.on("failed", (job, error) => {
  logger.error(
    "Email job failed",
    {
      event: "queue.job.failed",
      queue: EMAIL_QUEUE_NAME,
      jobId: job ? String(job.id) : undefined,
    },
    error,
  );
});

const shutdownEmailWorker = async () => {
  logger.info("Closing email worker gracefully", { event: "worker.shutdown.started", queue: EMAIL_QUEUE_NAME });
  try {
    await emailWorker.close();
    logger.info("Email worker closed gracefully", { event: "worker.shutdown.completed", queue: EMAIL_QUEUE_NAME });
  } catch (error) {
    logger.error("Error during email worker shutdown", { event: "worker.shutdown.error", queue: EMAIL_QUEUE_NAME }, error);
  }
};

process.on("SIGTERM", shutdownEmailWorker);
process.on("SIGINT", shutdownEmailWorker);
