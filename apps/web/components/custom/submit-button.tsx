// components/SubmitButton.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
}

export function SubmitButton({
  isLoading,
  loadingText = "Saving...",
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: SubmitButtonProps) {
  const baseStyles =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-sm";

  const variants = {
    primary:
      "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
    secondary:
      "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:bg-[#111] dark:border-white/10 dark:text-white dark:hover:bg-white/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
