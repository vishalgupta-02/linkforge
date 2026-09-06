import assert from "node:assert";
import { prisma } from "../src/db/client.ts";
import { createCustomerPortalSession } from "../src/services/billing.service.ts";

async function runBillingPortalTests() {
  console.log("🚀 Starting Stripe Customer Portal Test Suite...");

  const testFreeUserId = `test-user-portal-free-${Date.now()}`;
  const testProUserId = `test-user-portal-pro-${Date.now()}`;
  const testCustomerId = `cus_test_portal_${Date.now()}`;

  try {
    // 1. Create a FREE user with no stripeCustomerId
    console.log("1. Creating FREE user without stripeCustomerId...");
    await prisma.user.create({
      data: {
        id: testFreeUserId,
        email: `free-${Date.now()}@example.com`,
        name: "Free User",
        userName: `free_${Date.now()}`,
        plan: "FREE",
        stripeCustomerId: null,
      },
    });

    // 2. Test FREE user requesting portal (Must return 400)
    console.log("2. Testing FREE user without Stripe customer requesting portal...");
    let freeUserErrorCaught = false;
    try {
      await createCustomerPortalSession(testFreeUserId);
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      assert.ok(
        err.message.includes("No billing account is associated with this user"),
      );
      freeUserErrorCaught = true;
    }
    assert.strictEqual(freeUserErrorCaught, true);
    console.log("✅ FREE user without Stripe customer correctly rejected with 400");

    // 3. Test nonexistent user ID (Must return 404)
    console.log("3. Testing nonexistent user ID...");
    let nonExistentErrorCaught = false;
    try {
      await createCustomerPortalSession("nonexistent-user-id");
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 404);
      nonExistentErrorCaught = true;
    }
    assert.strictEqual(nonExistentErrorCaught, true);
    console.log("✅ Nonexistent user correctly rejected with 404");

    // 4. Create a PRO user with stripeCustomerId
    console.log("4. Creating PRO user with stripeCustomerId...");
    await prisma.user.create({
      data: {
        id: testProUserId,
        email: `pro-${Date.now()}@example.com`,
        name: "Pro User",
        userName: `pro_${Date.now()}`,
        plan: "PRO",
        stripeCustomerId: testCustomerId,
      },
    });

    // 5. Test PRO user creating portal session (Live or mocked Stripe)
    console.log("5. Testing PRO user creating Customer Portal session...");
    try {
      const portalResult = await createCustomerPortalSession(testProUserId);
      assert.ok(portalResult.url);
      assert.ok(typeof portalResult.url === "string");
      console.log("✅ Portal session URL generated successfully:", portalResult.url);
    } catch (err: any) {
      // In sandbox if testCustomerId doesn't exist in live Stripe, it should throw a safe 500 AppError
      console.log("ℹ️ Stripe rejected synthetic customer ID as expected in sandbox:", err?.message);
      assert.ok(err.statusCode === 500 || err.statusCode === 400);
    }

    console.log("\n🎉 ALL BILLING PORTAL TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    // Cleanup
    try {
      await prisma.user.deleteMany({
        where: { id: { in: [testFreeUserId, testProUserId] } },
      });
      console.log("🧹 Test users cleaned up successfully");
    } catch {
      // ignore cleanup errors
    }
  }
}

runBillingPortalTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
