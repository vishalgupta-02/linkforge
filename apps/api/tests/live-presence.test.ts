import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { redis } from "../src/lib/redis.ts";
import { CACHE_KEYS, LIVE_VISITOR_TTL } from "../src/lib/cache-keys.ts";
import {
  createLiveVisitor,
  refreshLiveVisitor,
  removeLiveVisitor,
  getLiveVisitorCount,
} from "../src/services/live.service.ts";
import { isProPlan } from "../src/utils/plan.ts";
import {
  liveVisitorBodySchema,
  liveVisitorParamsSchema,
} from "../src/validators/live.validator.ts";

describe("Live Presence Service & Helpers", () => {
  const userId1 = "test-user-1";
  const userId2 = "test-user-2";
  const session1 = "550e8400-e29b-41d4-a716-446655440001";
  const session2 = "550e8400-e29b-41d4-a716-446655440002";
  const session3 = "550e8400-e29b-41d4-a716-446655440003";

  beforeEach(async () => {
    // Clean up test keys
    const pattern = "live:user:test-user-*:visitor:*";
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  });

  afterEach(async () => {
    const pattern = "live:user:test-user-*:visitor:*";
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  });

  describe("Redis Key Formatting", () => {
    it("should generate correct key pattern", () => {
      const key = CACHE_KEYS.liveVisitor("user123", "sess456");
      expect(key).toBe("live:user:user123:visitor:sess456");
    });

    it("should generate correct scan pattern", () => {
      const pattern = CACHE_KEYS.liveVisitorPattern("user123");
      expect(pattern).toBe("live:user:user123:visitor:*");
    });
  });

  describe("createLiveVisitor", () => {
    it("should create key with 90s TTL in Redis", async () => {
      await createLiveVisitor(userId1, session1);

      const key = CACHE_KEYS.liveVisitor(userId1, session1);
      const exists = await redis.exists(key);
      expect(exists).toBe(1);

      const ttl = await redis.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(LIVE_VISITOR_TTL);
    });
  });

  describe("refreshLiveVisitor", () => {
    it("should refresh TTL for an existing key", async () => {
      await createLiveVisitor(userId1, session1);
      const key = CACHE_KEYS.liveVisitor(userId1, session1);

      // Artificially lower TTL to 30s
      await redis.expire(key, 30);
      let ttl = await redis.ttl(key);
      expect(ttl).toBeLessThanOrEqual(30);

      // Refresh
      await refreshLiveVisitor(userId1, session1);
      ttl = await redis.ttl(key);
      expect(ttl).toBeGreaterThan(30);
      expect(ttl).toBeLessThanOrEqual(LIVE_VISITOR_TTL);
    });

    it("should recreate key if it has already expired", async () => {
      const key = CACHE_KEYS.liveVisitor(userId1, session2);
      expect(await redis.exists(key)).toBe(0);

      await refreshLiveVisitor(userId1, session2);
      expect(await redis.exists(key)).toBe(1);
      const ttl = await redis.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(LIVE_VISITOR_TTL);
    });
  });

  describe("removeLiveVisitor", () => {
    it("should delete key idempotently", async () => {
      await createLiveVisitor(userId1, session1);
      const key = CACHE_KEYS.liveVisitor(userId1, session1);
      expect(await redis.exists(key)).toBe(1);

      await removeLiveVisitor(userId1, session1);
      expect(await redis.exists(key)).toBe(0);

      // Deleting again should not throw
      await expect(removeLiveVisitor(userId1, session1)).resolves.not.toThrow();
    });
  });

  describe("getLiveVisitorCount", () => {
    it("should accurately count active visitors using SCAN", async () => {
      expect(await getLiveVisitorCount(userId1)).toBe(0);

      await createLiveVisitor(userId1, session1);
      await createLiveVisitor(userId1, session2);
      await createLiveVisitor(userId2, session3); // Different user

      expect(await getLiveVisitorCount(userId1)).toBe(2);
      expect(await getLiveVisitorCount(userId2)).toBe(1);

      await removeLiveVisitor(userId1, session1);
      expect(await getLiveVisitorCount(userId1)).toBe(1);
    });
  });

  describe("Validation", () => {
    it("should validate valid UUID session IDs", () => {
      const valid = liveVisitorBodySchema.safeParse({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(valid.success).toBe(true);
    });

    it("should reject invalid session IDs", () => {
      const invalid = liveVisitorBodySchema.safeParse({
        sessionId: "not-a-uuid",
      });
      expect(invalid.success).toBe(false);
    });

    it("should validate username param", () => {
      const valid = liveVisitorParamsSchema.safeParse({ username: "alex" });
      expect(valid.success).toBe(true);

      const invalid = liveVisitorParamsSchema.safeParse({ username: "" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("Pro Plan Gating Helper", () => {
    it("should return true for PRO and BUSINESS plans", () => {
      expect(isProPlan("PRO")).toBe(true);
      expect(isProPlan("pro")).toBe(true);
      expect(isProPlan("BUSINESS")).toBe(true);
      expect(isProPlan("business")).toBe(true);
    });

    it("should return false for FREE plan or null", () => {
      expect(isProPlan("FREE")).toBe(false);
      expect(isProPlan("free")).toBe(false);
      expect(isProPlan(null)).toBe(false);
      expect(isProPlan(undefined)).toBe(false);
    });
  });
});
