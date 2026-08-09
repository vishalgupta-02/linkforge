// hooks/useSafeAction.ts
import { useState, useRef, useCallback } from "react";

interface SafeActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSafeAction<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>,
  options?: SafeActionOptions,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isExecuting = useRef(false);

  const execute = useCallback(
    async (...args: Args) => {
      // 🚫 Strict double-submit guard
      if (isExecuting.current) return;

      isExecuting.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const result = await action(...args);
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const parsedError =
          err instanceof Error ? err : new Error("An unknown error occurred");
        setError(parsedError);
        options?.onError?.(parsedError);
      } finally {
        isExecuting.current = false;
        setIsLoading(false);
      }
    },
    [action, options],
  );

  return { execute, isLoading, error };
}
