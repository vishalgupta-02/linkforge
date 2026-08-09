"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Twitter,
  Github,
  Linkedin,
  Heart,
  CheckCircle2,
  Pentagon,
} from "lucide-react";

// Routes where footer should not be displayed
const HIDDEN_FOOTER_ROUTES = [
  "/signin",
  "/signup",
  "/dashboard",
  "/onboarding",
  "/user",
  "/link",
  "/public-profile",
];

const LINKS = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Live Demo", href: "#demo" },
      { label: "Changelog", href: "/changelog" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Solutions",
    items: [
      { label: "Creators", href: "/creators" },
      { label: "Musicians", href: "/musicians" },
      { label: "Podcasters", href: "/podcasters" },
      { label: "Businesses", href: "/businesses" },
      { label: "Agencies", href: "/agencies" },
      { label: "Developers", href: "/developers" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Community", href: "/community" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press Kit", href: "/press" },
      { label: "Partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Legal", href: "/legal" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Github, href: "https://github.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
];

export default function Footer() {
  const pathname = usePathname();
  const [subscribed, setSubscribed] = useState(false);

  // Check if current route starts with any hidden route
  const shouldHideFooter = HIDDEN_FOOTER_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (shouldHideFooter) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="bg-background text-foreground border-border overflow-hidden border-t transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:px-10 lg:px-16">
        <div className="mb-16 flex flex-col justify-between gap-12 lg:flex-row">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Subscribe to our newsletter
            </h3>
            <p className="text-muted-foreground max-w-lg text-sm">
              Get the latest updates, news, and product improvements delivered
              to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full lg:max-w-md">
            {subscribed ? (
              <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 text-sm font-medium text-green-600 transition-all duration-200">
                <CheckCircle2 size={16} />
                Subscribed successfully!
              </div>
            ) : (
              <div className="flex w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="border-border bg-background focus:border-primary h-11 flex-1 rounded-l-lg border px-4 text-sm transition-all duration-200 outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground h-11 cursor-pointer rounded-r-lg px-4 text-sm font-medium transition-all duration-200 hover:opacity-90"
                >
                  Subscribe
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
            >
              <div className="border-border flex h-7 w-7 items-center justify-center rounded-full border bg-neutral-900 text-neutral-900 dark:bg-neutral-100 dark:text-gray-900">
                <Pentagon
                  size={14}
                  strokeWidth={2.5}
                  className="text-background"
                />
              </div>
              <span className="text-foreground text-sm font-semibold tracking-tight">
                Linkforge
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs text-sm">
              The link-in-bio platform built for serious creators. One link for
              everything — with analytics that actually matter.
            </p>

            <div className="flex gap-3">
              {SOCIALS.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className="border-border hover:bg-muted/50 group rounded-full border p-2 transition-all duration-200"
                  >
                    <Icon className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors duration-200" />
                  </a>
                );
              })}
            </div>
          </div>

          {LINKS.map((column, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h4 className="text-foreground mb-3 text-sm font-medium">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.items.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors duration-200"
                    >
                      {link.label}
                      {link.label === "Careers" && (
                        <span className="bg-primary/15 text-primary ml-1.5 inline-flex rounded-full px-1.75 py-0.5 text-[10px] font-semibold">
                          Hiring
                        </span>
                      )}
                      {link.label === "Status" && (
                        <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-green-600">
                          <span className="inline-block h-1.25 w-1.25 rounded-full bg-green-600" />
                          Operational
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="bg-muted border-border hover:bg-muted/70 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all duration-200 sm:w-auto">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-20 0 190 225"
                width="28"
                height="28"
                fill="#fff"
              >
                <path d="M114.73 34.02c5.84-7.07 9.78-16.91 8.71-26.71-8.38.34-18.61 5.59-24.63 12.62-4.81 5.59-9.15 15.65-7.88 25.26 9.42.77 18.65-4.96 23.8-11.17z" />

                <path d="M121.36 104.53c0-21.73 17.72-32.06 18.52-32.55-10.15-14.8-25.96-16.79-31.6-17.07-13.4-1.36-26.17 7.88-33.02 7.88-6.85 0-17.43-7.55-28.52-7.34-14.43.27-27.76 8.4-35.15 21.26-14.95 25.97-3.83 64.44 10.74 85.5 7.12 10.29 15.34 21.7 26.43 21.29 10.59-.41 14.65-6.85 27.46-6.85 12.79 0 16.59 6.85 27.73 6.58 11.41-.28 18.42-10.42 25.43-20.6 8.12-11.85 11.45-23.36 11.64-23.95-.24-.13-19.64-15-19.64-34.1z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-muted-foreground text-[10px] leading-none">
                Download on the
              </div>
              <div className="text-foreground mt-1 text-sm leading-none font-medium">
                App Store
              </div>
            </div>
          </button>
          <button className="bg-muted border-border hover:bg-muted/70 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all duration-200 sm:w-auto">
            <div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g fill="none" fillRule="evenodd">
                  <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-muted-foreground text-[10px] leading-none">
                Get It On
              </div>
              <div className="text-foreground mt-1 text-sm leading-none font-medium">
                Google Play
              </div>
            </div>
          </button>
        </div>

        <div className="mb-16 flex w-full justify-center overflow-hidden select-none">
          <div className="pointer-events-none mb-16 flex w-full justify-center overflow-hidden select-none">
            <span className="text-foreground/10 font-sans text-[80px] leading-none font-bold tracking-tighter md:text-[150px] lg:text-[240px]">
              Linkforge
            </span>
          </div>
        </div>

        <div className="border-border flex flex-col items-center justify-between gap-6 border-t pt-6 md:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Linkforge Inc. All rights reserved.
          </p>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            Made with <Heart size={12} className="text-primary fill-primary" />{" "}
            by the Linkforge Team
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground text-xs transition-all duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground text-xs transition-all duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground text-xs transition-all duration-200"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
