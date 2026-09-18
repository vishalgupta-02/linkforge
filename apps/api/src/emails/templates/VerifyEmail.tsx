import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface VerifyEmailProps {
  userName: string;
  verificationUrl: string;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  userName = "Creator",
  verificationUrl = "https://linkforge.bio/api/auth/verify-email?token=example",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for LinkForge</Preview>
      <Body style={main}>
        <Container style={container}>

          <Section style={headerSection}>
            <Heading style={brandTitle}>LinkForge</Heading>
            <Text style={brandSubtitle}>Link Management & Creator Intelligence</Text>
          </Section>

          <Section style={card}>
            <Heading style={greeting}>Verify your email address</Heading>
            <Text style={paragraph}>
              Hi <strong style={{ color: "#ffffff" }}>{userName}</strong>,
            </Text>
            <Text style={paragraph}>
              Thanks for signing up for LinkForge! To secure your account and protect our platform from automated bot registrations, please confirm your email address by clicking the button below.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={subtext}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={urlText}>
              {verificationUrl}
            </Text>

            <Text style={footerNote}>
              This link will expire in 24 hours. If you did not create a LinkForge account, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} LinkForge Inc. • Built for creators and developers.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;

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

const brandTitle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#ffffff",
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const brandSubtitle = {
  fontSize: "13px",
  color: "#a1a1aa",
  margin: "0",
};

const card = {
  backgroundColor: "#141414",
  borderRadius: "16px",
  border: "1px solid #27272a",
  padding: "32px 24px",
  marginBottom: "24px",
};

const greeting = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0 0 16px",
  letterSpacing: "-0.3px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#d4d4d8",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "28px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 28px",
  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
};

const subtext = {
  fontSize: "12px",
  color: "#a1a1aa",
  margin: "20px 0 6px",
};

const urlText = {
  fontSize: "11px",
  color: "#8b5cf6",
  wordBreak: "break-all" as const,
  backgroundColor: "#18181b",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #27272a",
  margin: "0 0 20px",
};

const footerNote = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#71717a",
  margin: "0",
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
