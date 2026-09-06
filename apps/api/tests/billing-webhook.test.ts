import assert from "node:assert";
import Stripe from "stripe";
import { prisma } from "../src/db/client.ts";
import { stripe } from "../src/lib/stripe.ts";
import { handleStripeWebhook } from "../src/services/billing.service.ts";

async function runBillingWebhookTests() {
  console.log("🚀 Starting Stripe Webhook Idempotency Test Suite...");

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;

  const testUserId = `test-user-webhook-${Date.now()}`;
  const testEmail = `webhook-test-${Date.now()}@example.com`;
  const testCustomerId = `cus_test_${Date.now()}`;
  const testSubscriptionId = `sub_test_${Date.now()}`;

  const createdEventIds: string[] = [];

  // Helper to generate valid signed payload
  const createSignedPayload = (payload: object) => {
    const payloadString = JSON.stringify(payload);
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: webhookSecret,
    });
    return {
      rawBody: Buffer.from(payloadString),
      signature: header,
    };
  };

  try {
    // 1. Create a test user with FREE plan
    console.log("1. Creating test user with FREE plan...");
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: testEmail,
        name: "Webhook Test User",
        userName: `user_${Date.now()}`,
        plan: "FREE",
      },
    });
    assert.strictEqual(user.plan, "FREE");
    console.log("✅ Test user created");

    // 2. Test Missing Signature (Must return 400 AppError, NO event saved)
    console.log("2. Testing missing signature...");
    let missingSigErrorCaught = false;
    try {
      await handleStripeWebhook(Buffer.from("{}"), undefined);
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      missingSigErrorCaught = true;
    }
    assert.strictEqual(missingSigErrorCaught, true);
    console.log("✅ Missing signature correctly rejected with 400");

    // 3. Test Invalid Signature (Must return 400 AppError, NO event saved)
    console.log("3. Testing invalid signature...");
    const invalidEventId = `evt_invalid_${Date.now()}`;
    let invalidSigErrorCaught = false;
    try {
      await handleStripeWebhook(
        Buffer.from(JSON.stringify({ id: invalidEventId })),
        "t=123,v1=invalid_signature_hash",
      );
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
      invalidSigErrorCaught = true;
    }
    assert.strictEqual(invalidSigErrorCaught, true);

    const invalidDbRecord = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId: invalidEventId },
    });
    assert.strictEqual(invalidDbRecord, null);
    console.log("✅ Invalid signature correctly rejected with 400 and no DB record created");

    // 4. Test checkout.session.completed (FREE -> PRO upgrade)
    console.log("4. Testing first delivery of checkout.session.completed...");
    const checkoutEventId = `evt_test_checkout_${Date.now()}`;
    createdEventIds.push(checkoutEventId);

    const checkoutSessionCompletedEvent = {
      id: checkoutEventId,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          object: "checkout.session",
          mode: "subscription",
          customer: testCustomerId,
          subscription: testSubscriptionId,
          client_reference_id: testUserId,
          metadata: {
            userId: testUserId,
            plan: "PRO",
          },
        },
      },
    };

    const signedUpgrade = createSignedPayload(checkoutSessionCompletedEvent);
    const upgradeResult = (await handleStripeWebhook(
      signedUpgrade.rawBody,
      signedUpgrade.signature,
    )) as { received: boolean; duplicate?: boolean };
    assert.strictEqual(upgradeResult.received, true);
    assert.strictEqual(upgradeResult.duplicate, undefined);

    const upgradedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    assert.strictEqual(upgradedUser?.plan, "PRO");
    assert.strictEqual(upgradedUser?.stripeCustomerId, testCustomerId);
    assert.strictEqual(upgradedUser?.stripeSubscriptionId, testSubscriptionId);

    const checkoutDbRecord = await prisma.stripeWebhookEvent.findUnique({
      where: { eventId: checkoutEventId },
    });
    assert.notStrictEqual(checkoutDbRecord, null);
    assert.strictEqual(checkoutDbRecord?.eventId, checkoutEventId);
    console.log("✅ First delivery upgraded user to PRO and persisted event record");

    // 5. Test Duplicate checkout.session.completed (Idempotency)
    console.log("5. Testing duplicate delivery of checkout.session.completed...");
    const auditLogsBefore = await prisma.auditlog.count({
      where: { userId: testUserId },
    });

    const duplicateResult = (await handleStripeWebhook(
      signedUpgrade.rawBody,
      signedUpgrade.signature,
    )) as { received: boolean; duplicate?: boolean };
    assert.strictEqual(duplicateResult.received, true);
    assert.strictEqual(duplicateResult.duplicate, true);

    const auditLogsAfter = await prisma.auditlog.count({
      where: { userId: testUserId },
    });
    assert.strictEqual(auditLogsAfter, auditLogsBefore); // No duplicate audit log created

    const eventCount = await prisma.stripeWebhookEvent.count({
      where: { eventId: checkoutEventId },
    });
    assert.strictEqual(eventCount, 1);
    console.log("✅ Duplicate delivery returned duplicate=true and did not re-execute business logic");

    // 6. Test Concurrent Duplicate Delivery
    console.log("6. Testing concurrent duplicate delivery...");
    const concurrentEventId = `evt_concurrent_${Date.now()}`;
    createdEventIds.push(concurrentEventId);

    const concurrentEvent = {
      id: concurrentEventId,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_concurrent_${Date.now()}`,
          object: "checkout.session",
          mode: "subscription",
          customer: testCustomerId,
          subscription: testSubscriptionId,
          client_reference_id: testUserId,
          metadata: {
            userId: testUserId,
            plan: "PRO",
          },
        },
      },
    };

    const signedConcurrent = createSignedPayload(concurrentEvent);
    const [resA, resB] = await Promise.all([
      handleStripeWebhook(signedConcurrent.rawBody, signedConcurrent.signature) as Promise<{ received: boolean; duplicate?: boolean }>,
      handleStripeWebhook(signedConcurrent.rawBody, signedConcurrent.signature) as Promise<{ received: boolean; duplicate?: boolean }>,
    ]);

    assert.strictEqual(resA.received, true);
    assert.strictEqual(resB.received, true);

    // Exactly one must be first delivery and the other duplicate
    const duplicateCount = [resA.duplicate, resB.duplicate].filter(Boolean).length;
    assert.strictEqual(duplicateCount, 1);

    const concurrentDbCount = await prisma.stripeWebhookEvent.count({
      where: { eventId: concurrentEventId },
    });
    assert.strictEqual(concurrentDbCount, 1);
    console.log("✅ Concurrent duplicate deliveries safely handled via UNIQUE constraint");

    // 7. Test customer.subscription.deleted (PRO -> FREE downgrade)
    console.log("7. Testing first delivery of customer.subscription.deleted...");
    const subDeletedEventId = `evt_sub_del_${Date.now()}`;
    createdEventIds.push(subDeletedEventId);

    const subscriptionDeletedEvent = {
      id: subDeletedEventId,
      object: "event",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: testSubscriptionId,
          object: "subscription",
          customer: testCustomerId,
          metadata: {
            userId: testUserId,
          },
        },
      },
    };

    const signedDowngrade = createSignedPayload(subscriptionDeletedEvent);
    const downgradeResult = (await handleStripeWebhook(
      signedDowngrade.rawBody,
      signedDowngrade.signature,
    )) as { received: boolean; duplicate?: boolean };
    assert.strictEqual(downgradeResult.received, true);
    assert.strictEqual(downgradeResult.duplicate, undefined);

    const downgradedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    assert.strictEqual(downgradedUser?.plan, "FREE");
    assert.strictEqual(downgradedUser?.stripeSubscriptionId, null);
    assert.strictEqual(downgradedUser?.stripeCustomerId, testCustomerId);
    console.log("✅ customer.subscription.deleted downgraded user to FREE");

    // 8. Test Duplicate customer.subscription.deleted
    console.log("8. Testing duplicate customer.subscription.deleted...");
    const duplicateDowngradeResult = (await handleStripeWebhook(
      signedDowngrade.rawBody,
      signedDowngrade.signature,
    )) as { received: boolean; duplicate?: boolean };
    assert.strictEqual(duplicateDowngradeResult.received, true);
    assert.strictEqual(duplicateDowngradeResult.duplicate, true);

    const finalUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    assert.strictEqual(finalUser?.plan, "FREE");
    console.log("✅ Duplicate downgrade ignored and returned duplicate=true");

    console.log("\n🎉 ALL STRIPE WEBHOOK IDEMPOTENCY TESTS PASSED SUCCESSFULLY!\n");
  } finally {
    // Cleanup test data
    try {
      if (createdEventIds.length > 0) {
        await prisma.stripeWebhookEvent.deleteMany({
          where: { eventId: { in: createdEventIds } },
        });
      }
      await prisma.auditlog.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
      console.log("🧹 Test records cleaned up successfully");
    } catch {
      // ignore cleanup errors
    }
  }
}

runBillingWebhookTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
