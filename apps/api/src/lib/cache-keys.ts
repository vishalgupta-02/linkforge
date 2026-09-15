export const LIVE_VISITOR_TTL = 90;
export const LIVE_HEARTBEAT_INTERVAL = 30_000;
export const REDIRECT_CACHE_TTL = 300; // 5 minutes

export const CACHE_KEYS = {
  publicProfile: (username: string) => `profile:${username.toLowerCase()}`,

  profileLock: (username: string) => `lock:profile:${username.toLowerCase()}`,

  redirect: (publicId: string) => `redirect:${publicId}`,

  analytics: (userId: string) => `analytics:${userId}`,

  liveVisitor: (userId: string, sessionId: string) =>
    `live:user:${userId}:visitor:${sessionId}`,

  liveVisitorPattern: (userId: string) => `live:user:${userId}:visitor:*`,

  liveVisitorZSet: (userId: string) => `live:zset:${userId}`,
};

