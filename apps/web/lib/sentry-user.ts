import * as Sentry from "@sentry/nextjs";

export interface SentryUserPayload {
  id: string;
  email?: string | null;
  name?: string | null;
  userName?: string | null;
}

/**
 * Sets Sentry user context on the client-side.
 * Captures user.id (and minimal safe attributes) for error correlation without high-cardinality tags.
 */
export function setSentryUser(user?: SentryUserPayload | null): void {
  if (!user || !user.id) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    ...(user.userName ? { username: user.userName } : {}),
  });
}

/**
 * Clears Sentry user context upon logout.
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}
