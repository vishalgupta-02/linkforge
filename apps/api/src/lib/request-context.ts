import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  userId: string | null;
  startTime?: bigint;
  route?: string;
  method?: string;
  [key: string]: unknown;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Returns the current request context store, or undefined if called outside an active request.
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Returns the current request's unique ID, or null if outside an active request context.
 */
export function getRequestId(): string | null {
  const store = asyncLocalStorage.getStore();
  return store?.requestId ?? null;
}

/**
 * Returns the current authenticated user ID, or null if anonymous / outside request context.
 */
export function getUserId(): string | null {
  const store = asyncLocalStorage.getStore();
  return store?.userId ?? null;
}

/**
 * Runs a function within an isolated asynchronous request context.
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Dynamically enriches the active request context with the authenticated user ID.
 */
export function updateUserContext(userId: string | null): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

/**
 * Updates arbitrary key-values in the active request context.
 */
export function updateRequestContext(updates: Partial<RequestContext>): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    Object.assign(store, updates);
  }
}
