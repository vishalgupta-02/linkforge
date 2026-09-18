"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  const handleToggle = useCallback(() => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme, mounted]);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn("inline-flex items-center justify-center p-2 rounded-lg", className)}
        {...props}
      >
        <span className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center justify-center p-2 rounded-lg transition-transform duration-150 active:scale-95 cursor-pointer",
        className
      )}
      {...props}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform duration-150 rotate-0 scale-100" />
      ) : (
        <Moon size={16} className="transition-transform duration-150 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
