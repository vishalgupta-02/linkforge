import type { FeedbackCategory } from "./feedback.ts";

export type EmailJobType =
  | "welcome-email"
  | "pro-upgrade-email"
  | "click-milestone-email"
  | "password-reset-email"
  | "verification-email"
  | "feedback-email";

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

export interface VerificationEmailJobData {
  userId: string;
  userName: string;
  email: string;
  verificationUrl: string;
}

export interface FeedbackEmailJobData {
  fromEmail: string;
  name?: string;
  category: FeedbackCategory | "general" | "bug" | "feature" | "billing" | "question" | "other";
  rating?: number;
  message: string;
  userId?: string;
  targetEmail: string;
}

export type EmailJobData =
  | WelcomeEmailJobData
  | ProUpgradeEmailJobData
  | ClickMilestoneEmailJobData
  | PasswordResetEmailJobData
  | VerificationEmailJobData
  | FeedbackEmailJobData;
