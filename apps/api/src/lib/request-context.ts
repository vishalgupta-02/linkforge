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

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function getRequestId(): string | null {
  const store = asyncLocalStorage.getStore();
  return store?.requestId ?? null;
}

export function getUserId(): string | null {
  const store = asyncLocalStorage.getStore();
  return store?.userId ?? null;
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

export function updateUserContext(userId: string | null): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

export function updateRequestContext(updates: Partial<RequestContext>): void {
  const store = asyncLocalStorage.getStore();
  if (store) {
    Object.assign(store, updates);
  }
}
