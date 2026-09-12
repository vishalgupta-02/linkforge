"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

import { useThemeStore } from "@/store";
import { SentryAuthSync } from "@/components/providers/sentry-auth-sync";

function ThemeInitializer() {
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const isDark = document.documentElement.classList.contains("dark");

    if (storedTheme) {
      setTheme(storedTheme as "light" | "dark");
    } else if (isDark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  return null;
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <SentryAuthSync />
      {children}
    </QueryClientProvider>
  );
}
