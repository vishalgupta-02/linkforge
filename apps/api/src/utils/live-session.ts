import {
  LIVE_VISITOR_TTL,
  LIVE_HEARTBEAT_INTERVAL,
  CACHE_KEYS,
} from "../lib/cache-keys.ts";

export { LIVE_VISITOR_TTL, LIVE_HEARTBEAT_INTERVAL };

export const getLiveVisitorKey = (userId: string, sessionId: string) => {
  return CACHE_KEYS.liveVisitor(userId, sessionId);
};

export const getLiveVisitorPattern = (userId: string) => {
  return CACHE_KEYS.liveVisitorPattern(userId);
};

