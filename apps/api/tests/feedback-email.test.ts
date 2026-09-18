import assert from "node:assert";
import { resend } from "../src/lib/resend.ts";
import {
  sendFeedbackEmail,
  type SendFeedbackEmailInput,
} from "../src/services/email.service.ts";
import {
  emailQueue,
  enqueueFeedbackEmail,
  FEEDBACK_EMAIL_JOB_NAME,
  type FeedbackEmailJobData,
} from "../src/queues/email.queue.ts";
import { feedbackSchema } from "../src/validators/feedback.validator.ts";

async function runFeedbackEmailTests() {
  console.log("🚀 Starting Feedback Email Test Suite...\n");

  const originalSend = resend.emails.send;

  try {
    // -------------------------------------------------------------
    // Test 1: Zod Schema Validation
    // -------------------------------------------------------------
    console.log("Test 1: Feedback Zod Schema Validator");
    const validFeedback = feedbackSchema.safeParse({
      name: "Abhimanyu",
      email: "abhimanyug987@gmail.com",
      category: "feature",
      rating: 5,
      message: "The new analytics dashboard is super fast and clean!",
    });
    assert.strictEqual(validFeedback.success, true);

    const invalidFeedback = feedbackSchema.safeParse({
      rating: 10, // max is 5
      message: "hi", // min is 5 chars
    });
    assert.strictEqual(invalidFeedback.success, false);
    console.log("✅ Test 1 Passed: Zod schema validates input parameters correctly.\n");

    // -------------------------------------------------------------
    // Test 2: sendFeedbackEmail renders template & targets abhimanyug987@gmail.com
    // -------------------------------------------------------------
    console.log("Test 2: sendFeedbackEmail delivers to abhimanyug987@gmail.com");
    let capturedResendPayload: any = null;

    resend.emails.send = (async (payload: any) => {
      capturedResendPayload = payload;
      return {
        data: { id: "feedback_msg_test_9988" },
        error: null,
      };
    }) as any;

    const feedbackInput: SendFeedbackEmailInput = {
      feedbackId: "fb_test_123",
      category: "bug",
      rating: 4,
      message: "Found a small layout shift on mobile devices.",
      name: "Beta Tester",
      email: "tester@example.com",
      userId: "usr_beta_456",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      ipAddress: "127.0.0.1",
    };

    const sendResult = await sendFeedbackEmail(feedbackInput);

    assert.strictEqual(sendResult.id, "feedback_msg_test_9988");
    assert.strictEqual(capturedResendPayload.to, "abhimanyug987@gmail.com");
    assert.strictEqual(capturedResendPayload.from, "LinkFlow Feedback <onboarding@resend.dev>");
    assert.ok(capturedResendPayload.subject.includes("BUG"));
    assert.ok(capturedResendPayload.subject.includes("4/5★"));
    assert.ok(capturedResendPayload.html.includes("Found a small layout shift"));
    assert.ok(capturedResendPayload.html.includes("Beta Tester"));
    assert.ok(capturedResendPayload.text.includes("Found a small layout shift"));
    console.log("✅ Test 2 Passed: Feedback rendered and addressed to abhimanyug987@gmail.com.\n");

    // -------------------------------------------------------------
    // Test 3: enqueueFeedbackEmail creates job in BullMQ queue
    // -------------------------------------------------------------
    console.log("Test 3: enqueueFeedbackEmail validates job creation in BullMQ queue");
    const originalAdd = emailQueue.add.bind(emailQueue);
    let capturedJobName = "";
    let capturedJobData: any = null;
    let capturedOpts: any = null;

    (emailQueue as any).add = async (name: string, data: any, opts: any) => {
      capturedJobName = name;
      capturedJobData = data;
      capturedOpts = opts;
      return {
        id: opts?.jobId || "mock_job_123",
        name,
        data,
        opts,
        remove: async () => {},
      };
    };

    const jobData: FeedbackEmailJobData = {
      feedbackId: `fb_${Date.now()}`,
      category: "feature",
      rating: 5,
      message: "Add support for dark mode toggle in public profile",
      name: "Alex",
      email: "alex@example.com",
      createdAt: new Date().toISOString(),
    };

    const job = await enqueueFeedbackEmail(jobData);
    assert.strictEqual(capturedJobName, FEEDBACK_EMAIL_JOB_NAME);
    assert.strictEqual(capturedJobData.feedbackId, jobData.feedbackId);
    assert.strictEqual(capturedJobData.category, "feature");
    assert.strictEqual(capturedJobData.rating, 5);
    assert.strictEqual(capturedJobData.message, jobData.message);
    assert.ok(capturedOpts.jobId);
    assert.ok(capturedOpts.jobId.startsWith(FEEDBACK_EMAIL_JOB_NAME));

    console.log("✅ Test 3 Passed: Job enqueued successfully with unique jobId.\n");

    console.log("🎉 ALL FEEDBACK EMAIL TESTS COMPLETED SUCCESSFULLY!\n");
    process.exit(0);
  } finally {
    resend.emails.send = originalSend;
  }
}

runFeedbackEmailTests().catch((err) => {
  console.error("❌ Feedback email test suite failed:", err);
  process.exit(1);
});
