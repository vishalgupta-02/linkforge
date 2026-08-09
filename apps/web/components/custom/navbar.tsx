"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, Pentagon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

const HIDDEN_NAVBAR_ROUTES = [
  "/signin",
  "/signup",
  "/dashboard",
  "/onboarding",
  "/user",
  "/link",
  "/profile",
  "/public-profile",
];

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const shouldHideNavbar = HIDDEN_NAVBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  const checkSession = async () => {
    try {
      const session = await authClient.getSession();
      setLoggedIn(!!session.data?.user);
    } catch (error) {
      console.error("Failed to check session:", error);
      setLoggedIn(false);
    }
  };

  // Check session on mount and route change
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      checkSession();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  // Listen for logout event from localStorage
  useEffect(() => {
    const handleLogout = () => {
      setLoggedIn(false);
    };

    window.addEventListener("logout-event", handleLogout);
    return () => window.removeEventListener("logout-event", handleLogout);
  }, []);

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <header className="border-border bg-background/80 sticky inset-x-0 top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-200 dark:bg-[#0a0a0a]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
        >
          <div className="border-border flex h-7 w-7 items-center justify-center rounded-full border bg-neutral-900 text-neutral-900 dark:bg-neutral-100 dark:text-gray-900">
            <Pentagon size={18} strokeWidth={2.5} className="text-background" />
          </div>
          <span className="text-foreground text-md font-semibold tracking-tight">
            linkforge
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            FAQ
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
          {loggedIn ? null : (
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium shadow transition-opacity duration-200 hover:opacity-90"
            >
              Get Started
            </Link>
          )}
          <div className="flex items-center justify-center">
            <AnimatedThemeToggler className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white" />
          </div>
        </div>
        <div className="block md:hidden">
          <MenuIcon
            size={20}
            strokeWidth={2.5}
            className="text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>
        {isMenuOpen && (
          <div className="bg-background fixed inset-0 z-50 flex h-full min-h-screen flex-col p-4 md:hidden dark:bg-[#0a0a0a]">
            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="border-border flex h-7 w-7 items-center justify-center rounded-full border bg-neutral-900 text-neutral-900 dark:bg-neutral-100 dark:text-gray-900">
                  <Pentagon
                    size={18}
                    strokeWidth={2.5}
                    className="text-background"
                  />
                </div>
                <span className="text-foreground text-lg font-semibold tracking-tight">
                  linkforge
                </span>
              </Link>
            </div>
            <nav className="mt-12 flex flex-col gap-4">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              {loggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              {loggedIn ? null : (
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium shadow transition-opacity duration-200 hover:opacity-90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
              <div className="flex items-center justify-center">
                <AnimatedThemeToggler className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
