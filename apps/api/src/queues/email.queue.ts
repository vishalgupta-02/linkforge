import { Queue } from "bullmq";
import { redis } from "../lib/redis.ts";

export interface WelcomeEmailJobData {
  userId: string;
  userName: string;
  email: string;
  dashboardUrl: string;
}

export interface ProUpgradeEmailJobData {
  userId: string;
  userName: string;
  email: string;
  dashboardUrl: string;
}

export interface ClickMilestoneEmailJobData {
  userId: string;
  userName: string;
  email: string;
  milestone: number;
  totalClicks: number;
  dashboardUrl: string;
}

export interface PasswordResetEmailJobData {
  userId: string;
  userName: string;
  email: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export type EmailJobData =
  | WelcomeEmailJobData
  | ProUpgradeEmailJobData
  | ClickMilestoneEmailJobData
  | PasswordResetEmailJobData;

export const EMAIL_QUEUE_NAME = "email";
export const WELCOME_EMAIL_JOB_NAME = "welcome-email";
export const PRO_UPGRADE_EMAIL_JOB_NAME = "pro-upgrade-email";
export const CLICK_MILESTONE_EMAIL_JOB_NAME = "click-milestone-email";
export const PASSWORD_RESET_EMAIL_JOB_NAME = "password-reset-email";

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 500,
    },
  },
});

/**
 * Enqueues a welcome email job with deduplication based on userId.
 */
export async function enqueueWelcomeEmail(data: WelcomeEmailJobData) {
  const jobId = `${WELCOME_EMAIL_JOB_NAME}-${data.userId}`;

  return await emailQueue.add(WELCOME_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

/**
 * Enqueues a Pro upgrade email job with deduplication based on stripeEventId or userId.
 */
export async function enqueueProUpgradeEmail(
  data: ProUpgradeEmailJobData,
  stripeEventId?: string,
) {
  const jobId = stripeEventId
    ? `${PRO_UPGRADE_EMAIL_JOB_NAME}-${stripeEventId}`
    : `${PRO_UPGRADE_EMAIL_JOB_NAME}-${data.userId}-${Date.now()}`;

  return await emailQueue.add(PRO_UPGRADE_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

/**
 * Enqueues a click milestone email job with deduplication based on userId and milestone.
 */
export async function enqueueClickMilestoneEmail(
  data: ClickMilestoneEmailJobData,
) {
  const jobId = `${CLICK_MILESTONE_EMAIL_JOB_NAME}-${data.userId}-${data.milestone}`;

  return await emailQueue.add(CLICK_MILESTONE_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

/**
 * Enqueues a password reset email job asynchronously.
 */
export async function enqueuePasswordResetEmail(
  data: PasswordResetEmailJobData,
) {
  const jobId = `${PASSWORD_RESET_EMAIL_JOB_NAME}-${data.userId}-${Date.now()}`;

  return await emailQueue.add(PASSWORD_RESET_EMAIL_JOB_NAME, data, {
    jobId,
  });
}
