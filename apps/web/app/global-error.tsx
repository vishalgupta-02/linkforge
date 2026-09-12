"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-900 text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="rounded bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
