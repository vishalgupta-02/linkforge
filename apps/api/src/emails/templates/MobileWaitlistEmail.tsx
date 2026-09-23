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

export interface MobileWaitlistEmailProps {
  email: string;
  waitlistNumber: number;
  platform?: string;
}

export const MobileWaitlistEmail: React.FC<MobileWaitlistEmailProps> = ({
  email = "creator@example.com",
  waitlistNumber = 42,
  platform = "all",
}) => {
  const platformName =
    platform === "ios"
      ? "iOS (TestFlight)"
      : platform === "android"
        ? "Android (Google Play Beta)"
        : "iOS & Android";

  return (
    <Html>
      <Head />
      <Preview>You're #{waitlistNumber} on the LinkForge Mobile App waitlist</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <div style={logoBadge}>LINKFORGE</div>
            <Heading style={headerTitle}>You're on the early access list</Heading>
            <Text style={headerSub}>
              We are building the most powerful link-in-bio native mobile app.
            </Text>
          </Section>

          {/* Priority Number Card */}
          <Section style={priorityCard}>
            <Text style={priorityLabel}>YOUR WAITLIST PRIORITY</Text>
            <Heading style={priorityNumber}>#{waitlistNumber}</Heading>
            <Text style={prioritySub}>
              Selected platform: <strong style={{ color: "#ffffff" }}>{platformName}</strong>
            </Text>
          </Section>

          {/* What to expect */}
          <Section style={featuresCard}>
            <Heading as="h3" style={featuresTitle}>
              What's coming to the native app:
            </Heading>
            <Text style={featureItem}>
              <strong>Real-time Push Notifications</strong>: Instant alerts whenever your links reach milestone clicks or experience high traffic spikes.
            </Text>
            <Text style={featureItem}>
              <strong>Instant Bio Reordering</strong>: Haptic drag-and-drop link sorting on the go.
            </Text>
            <Text style={featureItem}>
              <strong>iOS & Android Lock Screen Widgets</strong>: Live visitor ticker right on your phone's home screen.
            </Text>
            <Text style={featureItem}>
              <strong>Offline Telemetry Sync</strong>: Review performance insights anytime, anywhere.
            </Text>
          </Section>

          {/* Interim PWA tip */}
          <Section style={tipCard}>
            <Heading as="h4" style={tipTitle}>
              Can't wait? Install LinkForge today as a PWA
            </Heading>
            <Text style={tipText}>
              Open <strong>linkforge.com</strong> in your mobile browser (Safari on iOS or Chrome on Android), tap <strong>Share &gt; Add to Home Screen</strong>, and enjoy full app-like experience immediately.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Sent by the LinkForge Team. You received this because {email} registered for the LinkForge mobile app waitlist.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://linkforge.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href="https://linkforge.com/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MobileWaitlistEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 20px 48px",
  maxWidth: "560px",
};

const logoBadge = {
  display: "inline-block",
  backgroundColor: "#27272a",
  color: "#a1a1aa",
  padding: "4px 12px",
  borderRadius: "9999px",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.1em",
  marginBottom: "16px",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "28px",
};

const headerTitle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#ffffff",
  margin: "0 0 8px",
  letterSpacing: "-0.5px",
};

const headerSub = {
  fontSize: "14px",
  color: "#a1a1aa",
  margin: "0",
  lineHeight: "1.5",
};

const priorityCard = {
  backgroundColor: "#18181b",
  borderRadius: "16px",
  border: "1px solid #3f3f46",
  padding: "28px 20px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const priorityLabel = {
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.15em",
  color: "#a1a1aa",
  margin: "0 0 8px",
};

const priorityNumber = {
  fontSize: "48px",
  fontWeight: "900",
  color: "#38bdf8",
  margin: "0 0 8px",
  letterSpacing: "-1px",
};

const prioritySub = {
  fontSize: "13px",
  color: "#a1a1aa",
  margin: "0",
};

const featuresCard = {
  backgroundColor: "#141414",
  borderRadius: "12px",
  border: "1px solid #27272a",
  padding: "20px",
  marginBottom: "20px",
};

const featuresTitle = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 14px",
};

const featureItem = {
  fontSize: "13px",
  color: "#d4d4d8",
  margin: "8px 0",
  lineHeight: "1.6",
};

const tipCard = {
  backgroundColor: "#1e1b4b/30",
  borderRadius: "12px",
  border: "1px solid #4338ca",
  padding: "16px 20px",
  marginBottom: "24px",
};

const tipTitle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#c7d2fe",
  margin: "0 0 6px",
};

const tipText = {
  fontSize: "12px",
  color: "#e0e7ff",
  margin: "0",
  lineHeight: "1.5",
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
  margin: "0 0 8px",
};

const footerLinks = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "0",
};

const link = {
  color: "#a1a1aa",
  textDecoration: "underline",
};
