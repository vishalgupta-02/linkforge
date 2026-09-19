import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

import type { FeedbackCategory } from "@vyrex/types";

export interface FeedbackEmailProps {
  fromEmail?: string | undefined;
  name?: string | undefined;
  category?: FeedbackCategory | undefined;
  rating?: number | undefined;
  message: string;
  userId?: string | undefined;
  submittedAt?: string | undefined;
}

const categoryLabels: Record<string, string> = {
  general: "💬 General Feedback",
  bug: "🐛 Bug Report",
  feature: "✨ Feature Request",
  billing: "💳 Billing / Subscription",
  question: "❓ Question / Support",
  other: "📝 Other Feedback",
};

export const FeedbackEmail: React.FC<FeedbackEmailProps> = ({
  fromEmail = "user@example.com",
  name = "Anonymous Creator",
  category = "general",
  rating = 5,
  message = "Great platform!",
  userId,
  submittedAt = new Date().toUTCString(),
}) => {
  const stars = "★".repeat(Math.max(1, Math.min(5, rating || 5))) + "☆".repeat(Math.max(0, 5 - (rating || 5)));

  return (
    <Html>
      <Head />
      <Preview>New {categoryLabels[category] || "Feedback"} from {name}</Preview>
      <Body style={main}>
        <Container style={container}>

          <Section style={headerSection}>
            <Heading style={headerTitle}>LinkForge Feedback</Heading>
            <Text style={headerSub}>Direct User Submission</Text>
          </Section>

          <Section style={card}>
            <Text style={metaRow}>
              <strong style={label}>Category:</strong>{" "}
              <span style={categoryBadge}>{categoryLabels[category] || category}</span>
            </Text>
            <Text style={metaRow}>
              <strong style={label}>Rating:</strong>{" "}
              <span style={ratingText}>{stars} ({rating}/5)</span>
            </Text>
            <Text style={metaRow}>
              <strong style={label}>From:</strong> {name} (
              <Link href={`mailto:${fromEmail}`} style={link}>
                {fromEmail}
              </Link>
              )
            </Text>
            {userId && (
              <Text style={metaRow}>
                <strong style={label}>User ID:</strong>{" "}
                <code style={code}>{userId}</code>
              </Text>
            )}
            <Text style={metaRow}>
              <strong style={label}>Submitted At:</strong> {submittedAt}
            </Text>
          </Section>

          <Section style={messageSection}>
            <Heading as="h3" style={messageTitle}>
              Message Content:
            </Heading>
            <Text style={messageBox}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This notification was automatically routed via LinkForge BullMQ workers to{" "}
              <strong style={{ color: "#ffffff" }}>abhimanyug987@gmail.com</strong>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FeedbackEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 20px 48px",
  maxWidth: "580px",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const headerTitle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const headerSub = {
  fontSize: "13px",
  color: "#a1a1aa",
  margin: "0",
};

const card = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "16px 20px",
  marginBottom: "20px",
};

const metaRow = {
  fontSize: "13px",
  color: "#d4d4d8",
  margin: "6px 0",
  lineHeight: "1.5",
};

const label = {
  color: "#a1a1aa",
  fontWeight: "600",
};

const categoryBadge = {
  display: "inline-block",
  backgroundColor: "#27272a",
  color: "#e4e4e7",
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
};

const ratingText = {
  color: "#f59e0b",
  fontWeight: "600",
};

const link = {
  color: "#8b5cf6",
  textDecoration: "underline",
};

const code = {
  fontFamily: "monospace",
  fontSize: "12px",
  backgroundColor: "#27272a",
  padding: "2px 6px",
  borderRadius: "4px",
  color: "#a1a1aa",
};

const messageSection = {
  backgroundColor: "#18181b",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "20px",
  marginBottom: "24px",
};

const messageTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#e4e4e7",
  margin: "0 0 12px",
};

const messageBox = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#f4f4f5",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#27272a",
  margin: "24px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#71717a",
  lineHeight: "1.5",
  margin: "0",
};
