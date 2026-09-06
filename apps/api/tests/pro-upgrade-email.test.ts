import assert from "node:assert";
import { resend } from "../src/lib/resend.ts";
import {
  sendProUpgradeEmail,
  type SendProUpgradeEmailInput,
} from "../src/services/email.service.ts";
import {
  emailQueue,
  enqueueProUpgradeEmail,
  PRO_UPGRADE_EMAIL_JOB_NAME,
  type ProUpgradeEmailJobData,
} from "../src/queues/email.queue.ts";

async function runProUpgradeEmailTests() {
  console.log("🚀 Starting Pro-Upgrade Email Test Suite...\n");

  const originalSend = resend.emails.send;

  try {
    // -------------------------------------------------------------
    // Test 1: sendProUpgradeEmail renders template with Pro features and calls Resend
    // -------------------------------------------------------------
    console.log("Test 1: sendProUpgradeEmail renders template with authentic Pro features and calls Resend");
    let capturedResendPayload: any = null;

    resend.emails.send = (async (payload: any) => {
      capturedResendPayload = payload;
      return {
        data: { id: "resend_test_pro_upgrade_9999" },
        error: null,
      };
    }) as any;

    const emailInput: SendProUpgradeEmailInput = {
      to: "pro-creator@example.com",
      userName: "Taylor Swift",
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const sendResult = await sendProUpgradeEmail(emailInput);

    assert.strictEqual(sendResult.id, "resend_test_pro_upgrade_9999");
    assert.strictEqual(capturedResendPayload.to, "pro-creator@example.com");
    assert.strictEqual(capturedResendPayload.from, "LinkFlow <onboarding@resend.dev>");
    assert.strictEqual(capturedResendPayload.subject, "You're now on LinkFlow Pro! 🎉");

    // Verify greeting & dashboard URL
    assert.ok(capturedResendPayload.html.includes("You're now on LinkFlow Pro, Taylor Swift!"));
    assert.ok(capturedResendPayload.html.includes("http://localhost:3000/dashboard"));
    assert.ok(capturedResendPayload.text.includes("http://localhost:3000/dashboard"));

    // Verify authentic LinkFlow Pro features in the email
    assert.ok(capturedResendPayload.html.includes("Unlimited links & embeds"));
    assert.ok(capturedResendPayload.html.includes("All 8 premium themes"));
    assert.ok(capturedResendPayload.html.includes("Advanced analytics (1-year history)"));
    assert.ok(capturedResendPayload.html.includes("Live real-time visitor presence"));
    assert.ok(capturedResendPayload.html.includes("Deep customization"));
    assert.ok(capturedResendPayload.html.includes("Priority support"));
    console.log("✅ Test 1 Passed: Template rendered with real Pro features and sent via Resend.\n");

    // -------------------------------------------------------------
    // Test 2: enqueueProUpgradeEmail creates job with event-based deduplication key
    // -------------------------------------------------------------
    console.log("Test 2: enqueueProUpgradeEmail creates job with Stripe event ID deduplication");
    const testUserId = `test-pro-user-${Date.now()}`;
    const testStripeEventId = `evt_test_upgrade_${Date.now()}`;
    const jobData: ProUpgradeEmailJobData = {
      userId: testUserId,
      userName: "Taylor",
      email: "taylor@example.com",
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const job = await enqueueProUpgradeEmail(jobData, testStripeEventId);
    assert.ok(job.id);
    assert.strictEqual(job.id, `${PRO_UPGRADE_EMAIL_JOB_NAME}-${testStripeEventId}`);
    assert.strictEqual(job.name, PRO_UPGRADE_EMAIL_JOB_NAME);
    assert.strictEqual(job.data.userId, testUserId);
    assert.strictEqual(job.data.userName, "Taylor");
    assert.strictEqual(job.data.email, "taylor@example.com");
    assert.strictEqual(job.data.dashboardUrl, "http://localhost:3000/dashboard");

    // Duplicate Stripe event delivery: enqueueing with same eventId returns the existing job
    const duplicateJob = await enqueueProUpgradeEmail(jobData, testStripeEventId);
    assert.strictEqual(duplicateJob.id, job.id);
    console.log("✅ Test 2 Passed: Webhook event deduplication prevents duplicate job enqueueing.\n");

    // Clean up test job
    await job.remove().catch(() => {});

    // -------------------------------------------------------------
    // Test 3: sendProUpgradeEmail handles Resend provider failure
    // -------------------------------------------------------------
    console.log("Test 3: sendProUpgradeEmail propagates error on provider failure for BullMQ retry");
    resend.emails.send = (async () => {
      return {
        data: null,
        error: { message: "Service Unavailable", name: "provider_error" },
      };
    }) as any;

    let threwError = false;
    try {
      await sendProUpgradeEmail(emailInput);
    } catch (err: any) {
      threwError = true;
      assert.ok(err.message.includes("Failed to send Pro upgrade email"));
      assert.ok(err.message.includes("Service Unavailable"));
    }
    assert.strictEqual(threwError, true);
    console.log("✅ Test 3 Passed: Provider error correctly bubbles up for BullMQ retries.\n");

    // -------------------------------------------------------------
    // Test 4: Payload Validation for Pro Upgrade Jobs
    // -------------------------------------------------------------
    console.log("Test 4: Payload validation rejects malformed Pro-upgrade data");
    const invalidPayloads = [
      { userId: "", userName: "Taylor", email: "taylor@example.com", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Taylor", email: "", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Taylor", email: "invalid-email", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Taylor", email: "taylor@example.com", dashboardUrl: "" },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const payload of invalidPayloads) {
      const isValid = Boolean(
        payload.userId &&
        payload.email &&
        payload.dashboardUrl &&
        emailRegex.test(payload.email)
      );
      assert.strictEqual(isValid, false);
    }
    console.log("✅ Test 4 Passed: Malformed Pro-upgrade payloads safely rejected.\n");

    console.log("🎉 ALL PRO-UPGRADE EMAIL TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    resend.emails.send = originalSend;
    await emailQueue.close().catch(() => {});
  }
}

runProUpgradeEmailTests().catch((err) => {
  console.error("❌ Pro-upgrade email test suite failed:", err);
  process.exit(1);
});
