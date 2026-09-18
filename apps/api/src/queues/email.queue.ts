import { Queue } from "bullmq";
import { redis } from "../lib/redis.ts";
import type {
  WelcomeEmailJobData,
  ProUpgradeEmailJobData,
  ClickMilestoneEmailJobData,
  PasswordResetEmailJobData,
  VerificationEmailJobData,
  FeedbackEmailJobData,
  EmailJobData,
} from "@vyrex/types";

export type {
  WelcomeEmailJobData,
  ProUpgradeEmailJobData,
  ClickMilestoneEmailJobData,
  PasswordResetEmailJobData,
  VerificationEmailJobData,
  FeedbackEmailJobData,
  EmailJobData,
};

export const EMAIL_QUEUE_NAME = "email";
export const WELCOME_EMAIL_JOB_NAME = "welcome-email";
export const PRO_UPGRADE_EMAIL_JOB_NAME = "pro-upgrade-email";
export const CLICK_MILESTONE_EMAIL_JOB_NAME = "click-milestone-email";
export const PASSWORD_RESET_EMAIL_JOB_NAME = "password-reset-email";
export const VERIFICATION_EMAIL_JOB_NAME = "verification-email";
export const FEEDBACK_EMAIL_JOB_NAME = "feedback-email";

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

export async function enqueueWelcomeEmail(data: WelcomeEmailJobData) {
  const jobId = `${WELCOME_EMAIL_JOB_NAME}-${data.userId}`;

  return await emailQueue.add(WELCOME_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

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

export async function enqueueClickMilestoneEmail(
  data: ClickMilestoneEmailJobData,
) {
  const jobId = `${CLICK_MILESTONE_EMAIL_JOB_NAME}-${data.userId}-${data.milestone}`;

  return await emailQueue.add(CLICK_MILESTONE_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

export async function enqueuePasswordResetEmail(
  data: PasswordResetEmailJobData,
) {
  const jobId = `${PASSWORD_RESET_EMAIL_JOB_NAME}-${data.userId}-${Date.now()}`;

  return await emailQueue.add(PASSWORD_RESET_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

export async function enqueueVerificationEmail(
  data: VerificationEmailJobData,
) {
  const jobId = `${VERIFICATION_EMAIL_JOB_NAME}-${data.userId}-${Date.now()}`;

  return await emailQueue.add(VERIFICATION_EMAIL_JOB_NAME, data, {
    jobId,
  });
}

export async function enqueueFeedbackEmail(
  data: FeedbackEmailJobData,
) {
  const jobId = `${FEEDBACK_EMAIL_JOB_NAME}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return await emailQueue.add(FEEDBACK_EMAIL_JOB_NAME, data, {
    jobId,
  });
}
