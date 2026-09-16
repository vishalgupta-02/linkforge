import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { EmptyStateStyles } from "@/components/custom/empty-states";
import Footer from "@/components/custom/footer";
import Navbar from "@/components/custom/navbar";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.FRONTEND_URL ||
  "https://linkforge.bio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LinkForge — Build links. Understand every click.",
    template: "%s | LinkForge",
  },
  description:
    "Link management, ultra-low latency routing, and real-time click intelligence for developers and creators.",
  keywords: [
    "link-in-bio",
    "link management",
    "click analytics",
    "url redirect",
    "developer tools",
    "real-time tracking",
    "creator platform",
  ],
  authors: [{ name: "LinkForge Team" }],
  creator: "LinkForge",
  publisher: "LinkForge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LinkForge",
    title: "LinkForge — Build links. Understand every click.",
    description:
      "Link management, ultra-low latency routing, and real-time click intelligence for developers and creators.",
    images: [
      {
        url: "/opengraph-image",
        width: 1730,
        height: 909,
        alt: "LinkForge — Build links. Understand every click.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkForge — Build links. Understand every click.",
    description:
      "Link management, ultra-low latency routing, and real-time click intelligence for developers and creators.",
    images: ["/twitter-image"],
    creator: "@linkforge",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <Analytics />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-center" />
            <Footer />
            <EmptyStateStyles />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
