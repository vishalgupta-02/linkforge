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

export interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export const PasswordResetEmail = ({
  userName = "Creator",
  resetUrl = "http://localhost:3000/reset-password?token=example-token",
  expiresInMinutes = 60,
}: PasswordResetEmailProps) => {
  const previewText = `Reset your LinkFlow password (link active for ${expiresInMinutes} minutes)`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header & Brand with Security Badge */}
          <Section style={headerSection}>
            <div style={headerContent}>
              <Text style={brandText}>LinkFlow</Text>
              <span style={securityBadge}>SECURITY</span>
            </div>
          </Section>

          {/* Main Card Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              Reset your password
            </Heading>

            <Text style={paragraph}>
              Hello {userName},
            </Text>

            <Text style={paragraph}>
              We received a request to reset the password for your LinkFlow account. Click the button below to set a new password:
            </Text>

            {/* Primary CTA */}
            <Section style={ctaSection}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            {/* Expiration & Security Info Box */}
            <Section style={infoBox}>
              <Text style={infoTextTitle}>Important Security Information:</Text>
              <Text style={infoTextItem}>
                • This password reset link is time-sensitive and will expire in <strong>{expiresInMinutes} minutes (1 hour)</strong>.
              </Text>
              <Text style={infoTextItem}>
                • This link can only be used once. Once consumed, it is permanently invalidated.
              </Text>
              <Text style={infoTextItem}>
                • If you did not request a password reset, you can safely ignore this email. Your current password remains unchanged.
              </Text>
            </Section>

            {/* Fallback URL for restrictive email clients */}
            <Section style={fallbackSection}>
              <Text style={fallbackText}>
                If the button above does not work, copy and paste this link into your browser:
              </Text>
              <Link href={resetUrl} style={fallbackLink}>
                {resetUrl}
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Section style={footerSection}>
              <Text style={footerText}>
                You received this security email because a password reset was requested for your account.
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

PasswordResetEmail.PreviewProps = {
  userName: "Alex",
  resetUrl: "http://localhost:3000/reset-password?token=0123456789abcdef0123456789abcdef",
  expiresInMinutes: 60,
} as PasswordResetEmailProps;

export default PasswordResetEmail;

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

const securityBadge: React.CSSProperties = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
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
  margin: "0 0 16px 0",
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#6366f1",
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

const infoBox: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "24px 0",
};

const infoTextTitle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: 600,
  margin: "0 0 8px 0",
};

const infoTextItem: React.CSSProperties = {
  color: "#475569",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 6px 0",
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
  color: "#6366f1",
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
