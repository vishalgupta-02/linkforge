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

export interface ProUpgradeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export const ProUpgradeEmail = ({
  userName = "Creator",
  dashboardUrl = "http://localhost:3000/dashboard",
}: ProUpgradeEmailProps) => {
  const previewText = "You're officially on LinkFlow Pro — your new features are ready.";

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header & Brand with PRO Badge */}
          <Section style={headerSection}>
            <div style={headerContent}>
              <Text style={brandText}>LinkFlow</Text>
              <span style={proBadge}>PRO</span>
            </div>
          </Section>

          {/* Main Card Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              You&apos;re now on LinkFlow Pro, {userName}! 🎉
            </Heading>

            <Text style={paragraph}>
              Thank you for upgrading. Your subscription is active, and all premium
              Pro features have been unlocked for your account.
            </Text>

            {/* Unlocked Features Box */}
            <Section style={featuresBox}>
              <Text style={featuresHeading}>What&apos;s now unlocked for you:</Text>
              <ul style={featuresList}>
                <li style={featureItem}>
                  <strong>Unlimited links & embeds</strong> — Add all your links, music, videos, and custom sections.
                </li>
                <li style={featureItem}>
                  <strong>All 8 premium themes</strong> — Stand out with our exclusive creator styles and colors.
                </li>
                <li style={featureItem}>
                  <strong>Advanced analytics (1-year history)</strong> — Track clicks, top devices, referrers, and geo breakdown.
                </li>
                <li style={featureItem}>
                  <strong>Live real-time visitor presence</strong> — Watch live visitors engage with your public page.
                </li>
                <li style={featureItem}>
                  <strong>Deep customization</strong> — Full control over custom layouts, profile styling, and appearance.
                </li>
                <li style={featureItem}>
                  <strong>Priority support</strong> — Fast, dedicated assistance whenever you need help.
                </li>
              </ul>
            </Section>

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={dashboardUrl}>
                Go to your dashboard
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
                You received this email because you upgraded to LinkFlow Pro. You can manage your subscription anytime in your dashboard settings.
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

ProUpgradeEmail.PreviewProps = {
  userName: "Vishal",
  dashboardUrl: "http://localhost:3000/dashboard",
} as ProUpgradeEmailProps;

export default ProUpgradeEmail;

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

const proBadge: React.CSSProperties = {
  backgroundColor: "#7c3aed",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700,
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

const featuresBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const featuresHeading: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 700,
  margin: "0 0 12px 0",
};

const featuresList: React.CSSProperties = {
  color: "#334155",
  fontSize: "13px",
  lineHeight: "22px",
  margin: 0,
  paddingLeft: "20px",
};

const featureItem: React.CSSProperties = {
  marginBottom: "8px",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#7c3aed",
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
  color: "#7c3aed",
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
