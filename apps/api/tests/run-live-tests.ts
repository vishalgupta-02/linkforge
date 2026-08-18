import assert from "node:assert";
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

async function runTests() {
  console.log("🚀 Starting Live Presence Test Suite...");

  const userId1 = "test-user-1";
  const userId2 = "test-user-2";
  const session1 = "550e8400-e29b-41d4-a716-446655440001";
  const session2 = "550e8400-e29b-41d4-a716-446655440002";
  const session3 = "550e8400-e29b-41d4-a716-446655440003";

  // Clean up test keys
  const cleanup = async () => {
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
  };

  await cleanup();

  // Test 1: Key formatting
  console.log("Checking Redis key formatting...");
  const key1 = CACHE_KEYS.liveVisitor("user123", "sess456");
  assert.strictEqual(key1, "live:user:user123:visitor:sess456");
  const pattern1 = CACHE_KEYS.liveVisitorPattern("user123");
  assert.strictEqual(pattern1, "live:user:user123:visitor:*");
  console.log("✅ Key formatting passed");

  // Test 2: Create Live Visitor
  console.log("Checking createLiveVisitor...");
  await createLiveVisitor(userId1, session1);
  const createdKey = CACHE_KEYS.liveVisitor(userId1, session1);
  const exists = await redis.exists(createdKey);
  assert.strictEqual(exists, 1);
  const ttl = await redis.ttl(createdKey);
  assert(ttl > 0 && ttl <= LIVE_VISITOR_TTL, `Expected TTL <= 90, got ${ttl}`);
  console.log("✅ createLiveVisitor passed");

  // Test 3: Refresh Live Visitor
  console.log("Checking refreshLiveVisitor...");
  await redis.expire(createdKey, 30);
  assert((await redis.ttl(createdKey)) <= 30);
  await refreshLiveVisitor(userId1, session1);
  const refreshedTtl = await redis.ttl(createdKey);
  assert(refreshedTtl > 30, `Expected refreshed TTL > 30, got ${refreshedTtl}`);

  // Recreate expired
  await refreshLiveVisitor(userId1, session2);
  const key2 = CACHE_KEYS.liveVisitor(userId1, session2);
  assert.strictEqual(await redis.exists(key2), 1);
  console.log("✅ refreshLiveVisitor passed");

  // Test 4: Remove Live Visitor
  console.log("Checking removeLiveVisitor...");
  await removeLiveVisitor(userId1, session1);
  assert.strictEqual(await redis.exists(createdKey), 0);
  // Idempotent delete
  await removeLiveVisitor(userId1, session1);
  console.log("✅ removeLiveVisitor passed");

  // Test 5: SCAN Count
  console.log("Checking getLiveVisitorCount with SCAN...");
  await cleanup();
  assert.strictEqual(await getLiveVisitorCount(userId1), 0);
  await createLiveVisitor(userId1, session1);
  await createLiveVisitor(userId1, session2);
  await createLiveVisitor(userId2, session3);
  assert.strictEqual(await getLiveVisitorCount(userId1), 2);
  assert.strictEqual(await getLiveVisitorCount(userId2), 1);
  await removeLiveVisitor(userId1, session1);
  assert.strictEqual(await getLiveVisitorCount(userId1), 1);
  console.log("✅ getLiveVisitorCount passed");

  // Test 6: Zod validation
  console.log("Checking Zod validation...");
  assert.strictEqual(
    liveVisitorBodySchema.safeParse({ sessionId: session1 }).success,
    true,
  );
  assert.strictEqual(
    liveVisitorBodySchema.safeParse({ sessionId: "not-a-uuid" }).success,
    false,
  );
  assert.strictEqual(
    liveVisitorParamsSchema.safeParse({ username: "alex" }).success,
    true,
  );
  assert.strictEqual(
    liveVisitorParamsSchema.safeParse({ username: "" }).success,
    false,
  );
  console.log("✅ Zod validation passed");

  // Test 7: Pro Plan gating helper
  console.log("Checking Pro plan helper...");
  assert.strictEqual(isProPlan("PRO"), true);
  assert.strictEqual(isProPlan("pro"), true);
  assert.strictEqual(isProPlan("BUSINESS"), true);
  assert.strictEqual(isProPlan("FREE"), false);
  assert.strictEqual(isProPlan(null), false);
  assert.strictEqual(isProPlan(undefined), false);
  console.log("✅ Pro plan helper passed");

  await cleanup();
  await redis.quit();

  console.log("🎉 All Live Presence tests passed successfully!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
