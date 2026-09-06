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

export interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  userName = "there",
  dashboardUrl = "http://localhost:3000/dashboard",
}: WelcomeEmailProps) => {
  const previewText = "Welcome to LinkFlow — your profile is ready.";

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header & Brand */}
          <Section style={headerSection}>
            <Text style={brandText}>LinkFlow</Text>
          </Section>

          {/* Main Card Content */}
          <Section style={contentSection}>
            <Heading as="h1" style={heading}>
              Welcome to LinkFlow, {userName}.
            </Heading>

            <Text style={paragraph}>
              Your LinkFlow account is ready. Start building your custom profile,
              adding your favorite links, and sharing your unified page with your audience.
            </Text>

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
                You received this email because you created an account on LinkFlow.
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

WelcomeEmail.PreviewProps = {
  userName: "Vishal",
  dashboardUrl: "http://localhost:3000/dashboard",
} as WelcomeEmailProps;

export default WelcomeEmail;

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

const brandText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "-0.5px",
  margin: 0,
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
  margin: "0 0 24px 0",
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
