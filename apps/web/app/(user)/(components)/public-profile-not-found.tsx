"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMinus, ArrowUpLeftIcon } from "lucide-react";

export default function UserNotFound() {
  const pathname = usePathname();
  const [attemptedUsername, setAttemptedUsername] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        setAttemptedUsername(pathParts[0]);
      }
    }
  }, [pathname]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />

      <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen flex-col items-center justify-center px-6 font-sans">
        <div className="animate-fade-in-up flex w-full max-w-md flex-col items-center text-center">
          <div className="bg-muted border-border mb-6 flex h-16 w-16 items-center justify-center rounded-full border shadow-sm">
            <UserMinus
              size={24}
              className="text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>

          <h1 className="text-foreground mb-2 text-xl font-semibold tracking-tight">
            User not found
          </h1>

          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            The profile{" "}
            {attemptedUsername ? (
              <span className="text-foreground font-semibold">
                @{attemptedUsername}
              </span>
            ) : (
              "you're looking for"
            )}{" "}
            doesn’t exist or may have been removed. Check the spelling and try
            again.
          </p>

          <div className="flex w-full flex-col items-center gap-4 sm:w-auto">
            <Link
              href="/"
              className="border-border bg-background text-foreground hover:bg-muted/50 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-6 text-sm font-medium shadow-sm transition-colors active:scale-[0.98] sm:w-auto"
            >
              <ArrowUpLeftIcon size={16} className="text-muted-foreground" />
              Go home
            </Link>

            <Link
              href="/signup"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Want this username? Create your page
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
