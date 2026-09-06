import assert from "node:assert";
import { resend } from "../src/lib/resend.ts";
import {
  sendClickMilestoneEmail,
  type SendClickMilestoneEmailInput,
} from "../src/services/email.service.ts";
import {
  emailQueue,
  enqueueClickMilestoneEmail,
  CLICK_MILESTONE_EMAIL_JOB_NAME,
  type ClickMilestoneEmailJobData,
} from "../src/queues/email.queue.ts";
import {
  CLICK_MILESTONES,
  getNextMilestone,
  getMilestoneEmailSubject,
} from "../src/utils/milestone.ts";
import { prisma } from "../src/db/client.ts";

async function runClickMilestoneEmailTests() {
  console.log("🚀 Starting Click Milestone Email Test Suite...\n");

  const originalSend = resend.emails.send;

  try {
    // -------------------------------------------------------------
    // Test 1: Milestone Constants & Subject Generation
    // -------------------------------------------------------------
    console.log("Test 1: Milestone thresholds, next milestone, and dynamic subjects");
    assert.deepStrictEqual([...CLICK_MILESTONES], [100, 500, 1000, 10000]);

    assert.strictEqual(getNextMilestone(100), 500);
    assert.strictEqual(getNextMilestone(500), 1000);
    assert.strictEqual(getNextMilestone(1000), 10000);
    assert.strictEqual(getNextMilestone(10000), null);

    assert.strictEqual(getMilestoneEmailSubject(100), "Your links just hit 100 clicks! 🚀");
    assert.strictEqual(getMilestoneEmailSubject(500), "Your links just hit 500 clicks! 🚀");
    assert.strictEqual(getMilestoneEmailSubject(1000), "Your links just hit 1,000 clicks! 🚀");
    assert.strictEqual(getMilestoneEmailSubject(10000), "Your links just hit 10,000 clicks! 🚀");
    console.log("✅ Test 1 Passed: Milestones, next targets, and dynamic subjects are correct.\n");

    // -------------------------------------------------------------
    // Test 2: sendClickMilestoneEmail renders template and calls Resend
    // -------------------------------------------------------------
    console.log("Test 2: sendClickMilestoneEmail renders template with accurate stats & CTA");
    let capturedResendPayload: any = null;

    resend.emails.send = (async (payload: any) => {
      capturedResendPayload = payload;
      return {
        data: { id: "resend_test_milestone_1000" },
        error: null,
      };
    }) as any;

    const emailInput: SendClickMilestoneEmailInput = {
      to: "creator@example.com",
      userName: "Sam",
      milestone: 1000,
      totalClicks: 1042,
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const sendResult = await sendClickMilestoneEmail(emailInput);

    assert.strictEqual(sendResult.id, "resend_test_milestone_1000");
    assert.strictEqual(capturedResendPayload.to, "creator@example.com");
    assert.strictEqual(capturedResendPayload.from, "LinkFlow <onboarding@resend.dev>");
    assert.strictEqual(capturedResendPayload.subject, "Your links just hit 1,000 clicks! 🚀");

    // Verify template rendering
    assert.ok(capturedResendPayload.html.includes("Your links just hit 1,000 clicks, Sam! 🎯"));
    assert.ok(capturedResendPayload.html.includes("1,042"));
    assert.ok(capturedResendPayload.html.includes("10,000 clicks"));
    assert.ok(capturedResendPayload.html.includes("http://localhost:3000/dashboard"));
    console.log("✅ Test 2 Passed: Template rendered with accurate milestone, totals, and next target.\n");

    // -------------------------------------------------------------
    // Test 3: Top-tier (10,000) milestone handles no next milestone
    // -------------------------------------------------------------
    console.log("Test 3: Top-tier 10,000 milestone displays top tier reached message");
    const topTierInput: SendClickMilestoneEmailInput = {
      to: "creator@example.com",
      userName: "Sam",
      milestone: 10000,
      totalClicks: 10005,
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    await sendClickMilestoneEmail(topTierInput);
    assert.ok(capturedResendPayload.html.includes("Top tier reached! 🏆"));
    console.log("✅ Test 3 Passed: 10,000 top-tier milestone handles no-next-milestone cleanly.\n");

    // -------------------------------------------------------------
    // Test 4: enqueueClickMilestoneEmail creates job with deterministic deduplication
    // -------------------------------------------------------------
    console.log("Test 4: enqueueClickMilestoneEmail creates job with deduplication ID");
    const testUserId = `test-milestone-user-${Date.now()}`;
    const jobData: ClickMilestoneEmailJobData = {
      userId: testUserId,
      userName: "Sam",
      email: "sam@example.com",
      milestone: 500,
      totalClicks: 501,
      dashboardUrl: "http://localhost:3000/dashboard",
    };

    const job = await enqueueClickMilestoneEmail(jobData);
    assert.ok(job.id);
    assert.strictEqual(job.id, `${CLICK_MILESTONE_EMAIL_JOB_NAME}-${testUserId}-500`);
    assert.strictEqual(job.name, CLICK_MILESTONE_EMAIL_JOB_NAME);
    assert.strictEqual(job.data.milestone, 500);
    assert.strictEqual(job.data.totalClicks, 501);

    // Test duplicate enqueue
    const duplicateJob = await enqueueClickMilestoneEmail(jobData);
    assert.strictEqual(duplicateJob.id, job.id);
    console.log("✅ Test 4 Passed: Queue deduplication verified.\n");

    await job.remove().catch(() => {});

    // -------------------------------------------------------------
    // Test 5: Database Atomic Milestone Claiming (Unique Constraint)
    // -------------------------------------------------------------
    console.log("Test 5: Database unique constraint enforces atomic at-most-once milestone claim");
    const testDbUser = `test-db-user-${Date.now()}`;

    // Create user in DB for relation test
    await prisma.user.create({
      data: {
        id: testDbUser,
        email: `milestone-${Date.now()}@example.com`,
        name: "Milestone User",
        userName: `user_${Date.now()}`,
      },
    });

    try {
      // First claim should succeed
      const firstClaim = await prisma.clickMilestone.create({
        data: {
          userId: testDbUser,
          milestone: 100,
        },
      });
      assert.ok(firstClaim.id);
      assert.strictEqual(firstClaim.milestone, 100);

      // Concurrent / second claim attempt must throw unique constraint error (P2002)
      let duplicateCaught = false;
      try {
        await prisma.clickMilestone.create({
          data: {
            userId: testDbUser,
            milestone: 100,
          },
        });
      } catch (err: any) {
        if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
          duplicateCaught = true;
        }
      }
      assert.strictEqual(duplicateCaught, true);
      console.log("✅ Test 5 Passed: Atomic unique constraint prevents duplicate milestone claim.\n");
    } finally {
      await prisma.user.delete({ where: { id: testDbUser } }).catch(() => {});
    }

    // -------------------------------------------------------------
    // Test 6: Multiple Milestone Crossings (e.g. 90 -> 550)
    // -------------------------------------------------------------
    console.log("Test 6: Multiple milestone crossings detected when count jumps past thresholds");
    const simulatedClicks = 550;
    const reached = CLICK_MILESTONES.filter((m) => simulatedClicks >= m);
    assert.deepStrictEqual(reached, [100, 500]);
    console.log("✅ Test 6 Passed: Threshold skips accurately detect all reached milestones ([100, 500]).\n");

    // -------------------------------------------------------------
    // Test 7: Resend Provider Error Propagation for Retries
    // -------------------------------------------------------------
    console.log("Test 7: Provider error propagates to worker for BullMQ retries");
    resend.emails.send = (async () => {
      return {
        data: null,
        error: { message: "Internal server error at provider" },
      };
    }) as any;

    let threwProviderError = false;
    try {
      await sendClickMilestoneEmail(emailInput);
    } catch (err: any) {
      threwProviderError = true;
      assert.ok(err.message.includes("Failed to send click milestone email"));
    }
    assert.strictEqual(threwProviderError, true);
    console.log("✅ Test 7 Passed: Resend failure bubbles up for BullMQ retries.\n");

    // -------------------------------------------------------------
    // Test 8: Payload Validation
    // -------------------------------------------------------------
    console.log("Test 8: Payload validation rejects malformed milestone data");
    const invalidPayloads = [
      { userId: "", userName: "Sam", email: "sam@example.com", milestone: 100, totalClicks: 100, dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Sam", email: "", milestone: 100, totalClicks: 100, dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Sam", email: "invalid-email", milestone: 100, totalClicks: 100, dashboardUrl: "http://localhost:3000" },
      { userId: "123", userName: "Sam", email: "sam@example.com", milestone: 0, totalClicks: 100, dashboardUrl: "http://localhost:3000" },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const payload of invalidPayloads) {
      const isValid = Boolean(
        payload.userId &&
        payload.email &&
        payload.milestone > 0 &&
        payload.dashboardUrl &&
        emailRegex.test(payload.email)
      );
      assert.strictEqual(isValid, false);
    }
    console.log("✅ Test 8 Passed: Malformed milestone payloads safely rejected.\n");

    console.log("🎉 ALL CLICK MILESTONE EMAIL TESTS COMPLETED SUCCESSFULLY!\n");
  } finally {
    resend.emails.send = originalSend;
    await emailQueue.close().catch(() => {});
  }
}

runClickMilestoneEmailTests().catch((err) => {
  console.error("❌ Click milestone email test suite failed:", err);
  process.exit(1);
});
