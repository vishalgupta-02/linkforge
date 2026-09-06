import assert from "node:assert";
import { prisma } from "../src/db/client.ts";
import { getBillingStatus } from "../src/services/billing.service.ts";

async function runBillingStatusTests() {
  console.log("🚀 Starting Billing Status Test Suite...");

  const testFreeUserId = `test-user-status-free-${Date.now()}`;
  const testProUserId = `test-user-status-pro-${Date.now()}`;
  const testCustomerId = `cus_test_status_${Date.now()}`;

  try {
    // 1. Create test FREE user
    console.log("1. Creating test FREE user...");
    await prisma.user.create({
      data: {
        id: testFreeUserId,
        email: `free-${Date.now()}@example.com`,
        name: "Free User",
        userName: `free_${Date.now()}`,
        plan: "FREE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    });

    // 2. Fetch billing status for FREE user
    console.log("2. Testing getBillingStatus for FREE user...");
    const freeStatus = await getBillingStatus(testFreeUserId);
    assert.strictEqual(freeStatus.plan, "FREE");
    assert.strictEqual(freeStatus.subscriptionStatus, "INACTIVE");
    assert.strictEqual(freeStatus.nextBillingDate, null);
    assert.strictEqual(freeStatus.hasBillingAccount, false);
    assert.strictEqual((freeStatus as any).stripeSecretKey, undefined);
    console.log("✅ FREE user status correctly returned without fake dates");

    // 3. Create test PRO user
    console.log("3. Creating test PRO user...");
    const planExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.user.create({
      data: {
        id: testProUserId,
        email: `pro-${Date.now()}@example.com`,
        name: "Pro User",
        userName: `pro_${Date.now()}`,
        plan: "PRO",
        planExpiry: planExpiryDate,
        stripeCustomerId: testCustomerId,
        stripeSubscriptionId: null, // synthetic in test sandbox
      },
    });

    // 4. Fetch billing status for PRO user
    console.log("4. Testing getBillingStatus for PRO user...");
    const proStatus = await getBillingStatus(testProUserId);
    assert.strictEqual(proStatus.plan, "PRO");
    assert.strictEqual(proStatus.hasBillingAccount, true);
    assert.strictEqual((proStatus as any).stripeSecretKey, undefined);
    console.log("✅ PRO user status correctly returned:", proStatus);

    console.log("\n🎉 ALL BILLING STATUS TESTS COMPLETED SUCCESSFULLY!\n");
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

runBillingStatusTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
