import * as Sentry from "@sentry/nextjs";

export interface SentryUserPayload {
  id: string;
  email?: string | null;
  name?: string | null;
  userName?: string | null;
}

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

export function clearSentryUser(): void {
  Sentry.setUser(null);
}
