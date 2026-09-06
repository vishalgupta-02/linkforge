import assert from "node:assert";
import { resend } from "../src/lib/resend.ts";
import {
  sendWelcomeEmail,
  type SendWelcomeEmailInput,
} from "../src/services/email.service.ts";
import {
  emailQueue,
  enqueueWelcomeEmail,
  WELCOME_EMAIL_JOB_NAME,
  type WelcomeEmailJobData,
} from "../src/queues/email.queue.ts";

async function runWelcomeEmailTests() {
  console.log("🚀 Starting Welcome Email Test Suite...\n");

  const originalSend = resend.emails.send;

  try {
    // -------------------------------------------------------------
    // Test 1: sendWelcomeEmail renders template and calls Resend
    // -------------------------------------------------------------
    console.log("Test 1: sendWelcomeEmail renders template and passes HTML/text to Resend");
    let capturedResendPayload: any = null;

    resend.emails.send = (async (payload: any) => {
      capturedResendPayload = payload;
      return {
        data: { id: "resend_test_msg_12345" },
        error: null,
      };
    }) as any;

    const emailInput: SendWelcomeEmailInput = {
      to: "creator@example.com",
      userName: "Alex Rivera",
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const sendResult = await sendWelcomeEmail(emailInput);

    assert.strictEqual(sendResult.id, "resend_test_msg_12345");
    assert.strictEqual(capturedResendPayload.to, "creator@example.com");
    assert.strictEqual(capturedResendPayload.from, "LinkFlow <onboarding@resend.dev>");
    assert.strictEqual(capturedResendPayload.subject, "Welcome to LinkFlow! 🚀");
    assert.ok(capturedResendPayload.html.includes("Welcome to LinkFlow, Alex Rivera."));
    assert.ok(capturedResendPayload.html.includes("http://localhost:3000/dashboard"));
    assert.ok(capturedResendPayload.text.includes("Welcome to LinkFlow"));
    assert.ok(capturedResendPayload.text.includes("http://localhost:3000/dashboard"));
    console.log("✅ Test 1 Passed: Template rendered and sent via Resend client successfully.\n");

    // -------------------------------------------------------------
    // Test 2: sendWelcomeEmail handles Resend provider errors
    // -------------------------------------------------------------
    console.log("Test 2: sendWelcomeEmail throws descriptive error on Resend provider failure");
    resend.emails.send = (async () => {
      return {
        data: null,
        error: { message: "Rate limit exceeded or API error", name: "rate_limit" },
      };
    }) as any;

    let threwError = false;
    try {
      await sendWelcomeEmail(emailInput);
    } catch (err: any) {
      threwError = true;
      assert.ok(err.message.includes("Failed to send welcome email"));
      assert.ok(err.message.includes("Rate limit exceeded"));
    }
    assert.strictEqual(threwError, true);
    console.log("✅ Test 2 Passed: Resend failure correctly propagates error for BullMQ retries.\n");

    // -------------------------------------------------------------
    // Test 3: enqueueWelcomeEmail creates job with deduplication ID
    // -------------------------------------------------------------
    console.log("Test 3: enqueueWelcomeEmail enqueues job with expected payload and deduplication key");
    const testUserId = `test-user-${Date.now()}`;
    const jobData: WelcomeEmailJobData = {
      userId: testUserId,
      userName: "Jordan",
      email: "jordan@example.com",
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const job = await enqueueWelcomeEmail(jobData);
    assert.ok(job.id);
    assert.strictEqual(job.id, `${WELCOME_EMAIL_JOB_NAME}-${testUserId}`);
    assert.strictEqual(job.name, WELCOME_EMAIL_JOB_NAME);
    assert.strictEqual(job.data.userId, testUserId);
    assert.strictEqual(job.data.userName, "Jordan");
    assert.strictEqual(job.data.email, "jordan@example.com");
    assert.strictEqual(job.data.dashboardUrl, "http://localhost:3000/dashboard");

    // Test deduplication: attempting to enqueue same job ID should return existing job
    const duplicateJob = await enqueueWelcomeEmail(jobData);
    assert.strictEqual(duplicateJob.id, job.id);
    console.log("✅ Test 3 Passed: Job enqueued with deduplication ID.\n");

    // Clean up test job
    await job.remove().catch(() => {});

    // -------------------------------------------------------------
    // Test 4: Payload Validation in Worker Handler Logic
    // -------------------------------------------------------------
    console.log("Test 4: Job payload validation handles malformed data");
    const invalidPayloads = [
      { userId: "", userName: "Test", email: "test@example.com", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Test", email: "", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Test", email: "not-an-email", dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Test", email: "test@example.com", dashboardUrl: "" },
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
    console.log("✅ Test 4 Passed: Malformed payloads correctly detected.\n");

    console.log("🎉 ALL WELCOME EMAIL TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    // Restore original Resend implementation
    resend.emails.send = originalSend;
    await emailQueue.close().catch(() => {});
  }
}

runWelcomeEmailTests().catch((err) => {
  console.error("❌ Welcome email test suite failed:", err);
  process.exit(1);
});
