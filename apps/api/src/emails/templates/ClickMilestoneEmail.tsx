import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { getNextMilestone } from "../../utils/milestone.ts";

export interface ClickMilestoneEmailProps {
  userName: string;
  milestone: number;
  totalClicks: number;
  dashboardUrl: string;
}

export const ClickMilestoneEmail = ({
  userName = "Creator",
  milestone = 1000,
  totalClicks = 1000,
  dashboardUrl = "http://localhost:3000/dashboard",
}: ClickMilestoneEmailProps) => {
  const nextMilestone = getNextMilestone(milestone);
  const formattedMilestone = milestone.toLocaleString();
  const formattedTotalClicks = totalClicks.toLocaleString();
  const previewText = `Your LinkFlow links just reached ${formattedMilestone} total clicks! 🎯`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header & Brand with Milestone Badge */}
          <Section style={headerSection}>
            <div style={headerContent}>
              <Text style={brandText}>LinkFlow</Text>
              <span style={milestoneBadge}>MILESTONE</span>
            </div>
          </Section>

          {/* Main Card Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              Your links just hit {formattedMilestone} clicks, {userName}! 🎯
            </Heading>

            <Text style={paragraph}>
              Congratulations! Your audience is engaging with your LinkFlow profile,
              and you have officially reached a new traffic milestone.
            </Text>

            {/* Milestone Stats Card */}
            <Section style={statsBox}>
              <div style={statRow}>
                <span style={statLabel}>Milestone Reached:</span>
                <span style={statValueHighlight}>{formattedMilestone} clicks</span>
              </div>
              <div style={statRow}>
                <span style={statLabel}>Total Account Clicks:</span>
                <span style={statValue}>{formattedTotalClicks}</span>
              </div>
              <div style={statRowLast}>
                <span style={statLabel}>Next Goal:</span>
                <span style={statValueNext}>
                  {nextMilestone
                    ? `${nextMilestone.toLocaleString()} clicks`
                    : "Top tier reached! 🏆"}
                </span>
              </div>
            </Section>

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                View your analytics
              </Button>
            </Section>

            {/* Fallback URL for restrictive email clients */}
            <Section style={fallbackSection}>
              <Text style={fallbackText}>
                If the button above does not work, copy and paste this link into your browser:
              </Text>
              <Link href={dashboardUrl} style={fallbackLink}>
                {dashboardUrl}
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                You received this email because your links crossed a traffic threshold on LinkFlow.
              </Text>
              <Text style={footerCopyright}>
                © {new Date().getFullYear()} LinkFlow. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ClickMilestoneEmail.PreviewProps = {
  userName: "Vishal",
  milestone: 1000,
  totalClicks: 1024,
  dashboardUrl: "http://localhost:3000/dashboard",
} as ClickMilestoneEmailProps;

export default ClickMilestoneEmail;

// Conservative, email-compatible inline styles
const main: React.CSSProperties = {
  backgroundColor: "#f4f5f7",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: "0 auto",
  padding: "40px 16px",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  maxWidth: "560px",
  margin: "0 auto",
  padding: "0",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#0f172a",
  padding: "24px 32px",
  textAlign: "left" as const,
};

const headerContent: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const brandText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "-0.5px",
  margin: 0,
  display: "inline-block",
};

const milestoneBadge: React.CSSProperties = {
  backgroundColor: "#f59e0b",
  color: "#0f172a",
  fontSize: "11px",
  fontWeight: 800,
  padding: "2px 8px",
  borderRadius: "4px",
  marginLeft: "8px",
  letterSpacing: "0.5px",
  display: "inline-block",
  verticalAlign: "middle",
};

const contentSection: React.CSSProperties = {
  padding: "32px 32px 24px 32px",
};

const heading: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "30px",
  margin: "0 0 16px 0",
};

const paragraph: React.CSSProperties = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const statsBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
};

const statRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  borderBottom: "1px solid #edf2f7",
};

const statRowLast: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0 0 0",
};

const statLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 500,
};

const statValue: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 600,
};

const statValueHighlight: React.CSSProperties = {
  color: "#d97706",
  fontSize: "14px",
  fontWeight: 700,
};

const statValueNext: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "14px",
  fontWeight: 600,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
  lineHeight: "100%",
};

const fallbackSection: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "14px 16px",
  margin: "24px 0",
};

const fallbackText: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 6px 0",
};

const fallbackLink: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "13px",
  lineHeight: "18px",
  wordBreak: "break-all" as const,
  textDecoration: "underline",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "24px 0 20px 0",
};

const footerSection: React.CSSProperties = {
  textAlign: "left" as const,
};

const footerText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 6px 0",
};

const footerCopyright: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};
