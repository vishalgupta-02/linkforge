import assert from "node:assert";
import type { Request, Response } from "express";
import { prisma } from "../src/db/client.ts";
import { requirePro, requirePlan } from "../src/middlewares/plan-guard.middleware.ts";

async function runPlanGuardTests() {
  console.log("🚀 Starting Centralized Plan Guard Test Suite...");

  const testFreeUserId = `test-user-free-${Date.now()}`;
  const testProUserId = `test-user-pro-${Date.now()}`;
  const testBusinessUserId = `test-user-biz-${Date.now()}`;

  const mockRes = {} as Response;

  try {
    // 1. Create test users in DB
    console.log("1. Creating test users in DB...");
    await prisma.user.createMany({
      data: [
        {
          id: testFreeUserId,
          email: `free-${Date.now()}@example.com`,
          name: "Free User",
          userName: `free_${Date.now()}`,
          plan: "FREE",
        },
        {
          id: testProUserId,
          email: `pro-${Date.now()}@example.com`,
          name: "Pro User",
          userName: `pro_${Date.now()}`,
          plan: "PRO",
        },
        {
          id: testBusinessUserId,
          email: `biz-${Date.now()}@example.com`,
          name: "Business User",
          userName: `biz_${Date.now()}`,
          plan: "BUSINESS",
        },
      ],
    });
    console.log("✅ Test users created");

    // 2. Test Unauthenticated Request (No req.user) -> 401
    console.log("2. Testing unauthenticated request...");
    const unauthReq = {} as Request;
    let unauthErrorCaught = false;
    try {
      await requirePro(unauthReq, mockRes, () => {});
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 401);
      unauthErrorCaught = true;
    }
    assert.strictEqual(unauthErrorCaught, true);
    console.log("✅ Unauthenticated request rejected with 401");

    // 3. Test Authenticated FREE User -> 403 PRO_PLAN_REQUIRED
    console.log("3. Testing authenticated FREE user...");
    const freeReq = {
      user: { id: testFreeUserId, email: "free@example.com", plan: "FREE" },
    } as Request;

    let freeErrorCaught = false;
    try {
      await requirePro(freeReq, mockRes, () => {});
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "PRO_PLAN_REQUIRED");
      assert.ok(err.message.includes("requires a Pro plan"));
      freeErrorCaught = true;
    }
    assert.strictEqual(freeErrorCaught, true);
    console.log("✅ FREE user correctly rejected with 403 PRO_PLAN_REQUIRED");

    // 4. Test Client Attempting to Spoof Plan in Request Object -> Still 403 (DB Truth)
    console.log("4. Testing client attempt to spoof plan in request...");
    const spoofReq = {
      user: { id: testFreeUserId, email: "free@example.com", plan: "PRO" }, // spoofed in object
    } as Request;

    let spoofErrorCaught = false;
    try {
      await requirePro(spoofReq, mockRes, () => {});
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "PRO_PLAN_REQUIRED");
      spoofErrorCaught = true;
    }
    assert.strictEqual(spoofErrorCaught, true);
    console.log("✅ Spoofed plan in request rejected; database plan was enforced");

    // 5. Test Authenticated PRO User -> Authorized (next called)
    console.log("5. Testing authenticated PRO user...");
    const proReq = {
      user: { id: testProUserId, email: "pro@example.com", plan: "FREE" }, // stale object updated by middleware
    } as Request;

    let nextCalled = false;
    await requirePro(proReq, mockRes, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(proReq.user.plan, "PRO");
    console.log("✅ PRO user authorized and request.user.plan updated to PRO");

    // 6. Test Authenticated BUSINESS User -> Authorized (hierarchical access)
    console.log("6. Testing authenticated BUSINESS user on Pro feature...");
    const bizReq = {
      user: { id: testBusinessUserId, email: "biz@example.com", plan: "BUSINESS" },
    } as Request;

    let bizNextCalled = false;
    await requirePro(bizReq, mockRes, () => {
      bizNextCalled = true;
    });
    assert.strictEqual(bizNextCalled, true);
    console.log("✅ BUSINESS user granted access to Pro-level feature");

    // 7. Test Immediate Effect of Plan Mutation (FREE -> PRO in DB)
    console.log("7. Testing immediate authorization after DB upgrade...");
    await prisma.user.update({
      where: { id: testFreeUserId },
      data: { plan: "PRO" },
    });

    let upgradedNextCalled = false;
    const newlyProReq = {
      user: { id: testFreeUserId, email: "free@example.com", plan: "FREE" },
    } as Request;

    await requirePro(newlyProReq, mockRes, () => {
      upgradedNextCalled = true;
    });
    assert.strictEqual(upgradedNextCalled, true);
    assert.strictEqual(newlyProReq.user.plan, "PRO");
    console.log("✅ Database plan upgrade immediately takes effect on next request");

    // 8. Test Immediate Effect of Plan Downgrade (PRO -> FREE in DB)
    console.log("8. Testing immediate revocation after DB downgrade...");
    await prisma.user.update({
      where: { id: testFreeUserId },
      data: { plan: "FREE" },
    });

    let downgradedErrorCaught = false;
    try {
      await requirePro(newlyProReq, mockRes, () => {});
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "PRO_PLAN_REQUIRED");
      downgradedErrorCaught = true;
    }
    assert.strictEqual(downgradedErrorCaught, true);
    console.log("✅ Database plan downgrade immediately revokes access with 403");

    console.log("\n🎉 ALL PLAN GUARD TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    // Cleanup
    try {
      await prisma.user.deleteMany({
        where: { id: { in: [testFreeUserId, testProUserId, testBusinessUserId] } },
      });
      console.log("🧹 Test users cleaned up successfully");
    } catch {
      // ignore cleanup errors
    }
  }
}

runPlanGuardTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
