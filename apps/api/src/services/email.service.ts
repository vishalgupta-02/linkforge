import * as React from "react";
import { render } from "@react-email/components";
import { WelcomeEmail } from "../emails/templates/WelcomeEmail.tsx";
import { ProUpgradeEmail } from "../emails/templates/ProUpgradeEmail.tsx";
import { ClickMilestoneEmail } from "../emails/templates/ClickMilestoneEmail.tsx";
import { PasswordResetEmail } from "../emails/templates/PasswordResetEmail.tsx";
import { VerifyEmail } from "../emails/templates/VerifyEmail.tsx";
import { FeedbackEmail } from "../emails/templates/FeedbackEmail.tsx";
import { getMilestoneEmailSubject } from "../utils/milestone.ts";
import { resend } from "../lib/resend.ts";

export interface SendTestEmailInput {
  to: string;
}
export interface SendTestEmailOutput {
  id: string;
}

export async function sendTestEmail(
  input: SendTestEmailInput,
): Promise<SendTestEmailOutput> {
  const { to } = input;

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to: to,
    subject: "LinkFlow — Resend Test Email",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>LinkFlow — Resend Test</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
            "
          >
            <h1 style="margin-top: 0;">
              LinkFlow Email Test
            </h1>

            <p>
              This is a test email from the LinkFlow backend.
            </p>

            <p>
              Resend has successfully received this email request.
            </p>

            <p>
              <strong>Status:</strong> Email integration is working.
            </p>

            <hr
              style="
                margin: 32px 0;
                border: none;
                border-top: 1px solid #e5e5e5;
              "
            />

            <p
              style="
                margin-bottom: 0;
                color: #666666;
                font-size: 14px;
              "
            >
              LinkFlow
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
LinkFlow Email Test

This is a test email from the LinkFlow backend.

Resend has successfully received this email request.

Status: Email integration is working.

LinkFlow
    `.trim(),
  });

  if (error) {
    console.log("Error while sending test email");
    throw new Error("Failed to send test email");
  }

  if (!data.id) {
    throw new Error("Resend did not send an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendWelcomeEmailInput {
  to: string;
  userName: string;
  dashboardUrl: string;
}

export interface SendWelcomeEmailOutput {
  id: string;
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput,
): Promise<SendWelcomeEmailOutput> {
  const { to, userName, dashboardUrl } = input;

  const html = await render(
    React.createElement(WelcomeEmail, {
      userName,
      dashboardUrl,
    }),
  );

  const text = await render(
    React.createElement(WelcomeEmail, {
      userName,
      dashboardUrl,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to,
    subject: "Welcome to LinkFlow! 🚀",
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending welcome email:", error);
    throw new Error(
      `Failed to send welcome email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendProUpgradeEmailInput {
  to: string;
  userName: string;
  dashboardUrl: string;
}

export interface SendProUpgradeEmailOutput {
  id: string;
}

export async function sendProUpgradeEmail(
  input: SendProUpgradeEmailInput,
): Promise<SendProUpgradeEmailOutput> {
  const { to, userName, dashboardUrl } = input;

  const html = await render(
    React.createElement(ProUpgradeEmail, {
      userName,
      dashboardUrl,
    }),
  );

  const text = await render(
    React.createElement(ProUpgradeEmail, {
      userName,
      dashboardUrl,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to,
    subject: "You're now on LinkFlow Pro! 🎉",
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending Pro upgrade email:", error);
    throw new Error(
      `Failed to send Pro upgrade email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendClickMilestoneEmailInput {
  to: string;
  userName: string;
  milestone: number;
  totalClicks: number;
  dashboardUrl: string;
}

export interface SendClickMilestoneEmailOutput {
  id: string;
}

export async function sendClickMilestoneEmail(
  input: SendClickMilestoneEmailInput,
): Promise<SendClickMilestoneEmailOutput> {
  const { to, userName, milestone, totalClicks, dashboardUrl } = input;
  const subject = getMilestoneEmailSubject(milestone);

  const html = await render(
    React.createElement(ClickMilestoneEmail, {
      userName,
      milestone,
      totalClicks,
      dashboardUrl,
    }),
  );

  const text = await render(
    React.createElement(ClickMilestoneEmail, {
      userName,
      milestone,
      totalClicks,
      dashboardUrl,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending click milestone email:", error);
    throw new Error(
      `Failed to send click milestone email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendPasswordResetEmailInput {
  to: string;
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface SendPasswordResetEmailOutput {
  id: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<SendPasswordResetEmailOutput> {
  const { to, userName, resetUrl, expiresInMinutes = 60 } = input;

  const html = await render(
    React.createElement(PasswordResetEmail, {
      userName,
      resetUrl,
      expiresInMinutes,
    }),
  );

  const text = await render(
    React.createElement(PasswordResetEmail, {
      userName,
      resetUrl,
      expiresInMinutes,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to,
    subject: "Reset your LinkFlow password",
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending password reset email:", error);
    throw new Error(
      `Failed to send password reset email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendVerificationEmailInput {
  to: string;
  userName: string;
  verificationUrl: string;
}

export interface SendVerificationEmailOutput {
  id: string;
}

export async function sendVerificationEmail(
  input: SendVerificationEmailInput,
): Promise<SendVerificationEmailOutput> {
  const { to, userName, verificationUrl } = input;

  const html = await render(
    React.createElement(VerifyEmail, {
      userName,
      verificationUrl,
    }),
  );

  const text = await render(
    React.createElement(VerifyEmail, {
      userName,
      verificationUrl,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow <onboarding@resend.dev>",
    to,
    subject: "Verify your LinkForge email address 🔒",
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending verification email:", error);
    throw new Error(
      `Failed to send verification email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}

export interface SendFeedbackEmailInput {
  targetEmail?: string;
  fromEmail?: string;
  name?: string;
  category?: "general" | "bug" | "feature" | "billing" | "question" | "other";
  rating?: number;
  message: string;
  userId?: string;
}

export interface SendFeedbackEmailOutput {
  id: string;
}

export async function sendFeedbackEmail(
  input: SendFeedbackEmailInput,
): Promise<SendFeedbackEmailOutput> {
  const {
    targetEmail = "abhimanyug987@gmail.com",
    fromEmail,
    name,
    category = "general",
    rating = 5,
    message,
    userId,
  } = input;

  const submittedAt = new Date().toUTCString();

  const html = await render(
    React.createElement(FeedbackEmail, {
      fromEmail,
      name,
      category,
      rating,
      message,
      userId,
      submittedAt,
    }),
  );

  const text = await render(
    React.createElement(FeedbackEmail, {
      fromEmail,
      name,
      category,
      rating,
      message,
      userId,
      submittedAt,
    }),
    {
      plainText: true,
    },
  );

  const { data, error } = await resend.emails.send({
    from: "LinkFlow Feedback <onboarding@resend.dev>",
    to: targetEmail,
    ...(fromEmail ? { replyTo: fromEmail } : {}),
    subject: `[LinkForge Feedback] ${category.toUpperCase()} (${rating}/5★): from ${name || fromEmail || "Anonymous"}`,
    html,
    text,
  });

  if (error) {
    console.error("❌ Resend error while sending feedback email:", error);
    throw new Error(
      `Failed to send feedback email: ${error.message || "Unknown provider error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email id");
  }

  return {
    id: data.id,
  };
}
