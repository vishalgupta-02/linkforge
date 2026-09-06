import assert from "node:assert";
import { resend } from "../src/lib/resend.ts";
import {
  generateSecureToken,
  hashToken,
} from "../src/utils/token.utils.ts";
import {
  forgotPasswordSchema,
  verifyResetTokenSchema,
  resetPasswordSchema,
} from "../src/validators/auth.validator.ts";
import {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "../src/services/auth-reset.service.ts";
import {
  sendPasswordResetEmail,
  type SendPasswordResetEmailInput,
} from "../src/services/email.service.ts";
import {
  emailQueue,
  enqueuePasswordResetEmail,
  PASSWORD_RESET_EMAIL_JOB_NAME,
} from "../src/queues/email.queue.ts";
import { verifyPassword } from "better-auth/crypto";
import { prisma } from "../src/db/client.ts";

async function runPasswordResetTestSuite() {
  console.log("🚀 Starting Complete Password Reset Test Suite...\n");

  const originalSend = resend.emails.send;

  try {
    // -------------------------------------------------------------
    // Test 1: Cryptographic Token Generation & SHA-256 Hashing
    // -------------------------------------------------------------
    console.log("Test 1: Cryptographic token generation & SHA-256 hashing");
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    assert.strictEqual(typeof token1, "string");
    assert.strictEqual(token1.length, 64); // 32 bytes in hex = 64 characters
    assert.notStrictEqual(token1, token2); // High entropy randomness

    const hash1 = hashToken(token1);
    const hash2 = hashToken(token1);
    const hash3 = hashToken(token2);

    assert.strictEqual(hash1.length, 64);
    assert.strictEqual(hash1, hash2); // Deterministic hash
    assert.notStrictEqual(hash1, hash3); // Distinct hashes for distinct tokens
    assert.notStrictEqual(hash1, token1); // Hash is different from raw token
    console.log("✅ Test 1 Passed: Secure random token generator and SHA-256 hasher verified.\n");

    // -------------------------------------------------------------
    // Test 2: Zod Validator Validation
    // -------------------------------------------------------------
    console.log("Test 2: Zod schema validation (forgotPassword, verify, resetPassword)");
    // forgotPasswordSchema
    assert.strictEqual(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success, true);
    assert.strictEqual(forgotPasswordSchema.safeParse({ email: "  USER@EXAMPLE.COM  " }).success, true);
    assert.strictEqual(forgotPasswordSchema.safeParse({ email: "invalid-email" }).success, false);
    assert.strictEqual(forgotPasswordSchema.safeParse({ email: "" }).success, false);

    // verifyResetTokenSchema
    assert.strictEqual(verifyResetTokenSchema.safeParse({ token: "abcdef123456" }).success, true);
    assert.strictEqual(verifyResetTokenSchema.safeParse({ token: "" }).success, false);
    assert.strictEqual(verifyResetTokenSchema.safeParse({}).success, false);

    // resetPasswordSchema
    assert.strictEqual(
      resetPasswordSchema.safeParse({
        token: "abcdef123456",
        password: "NewStrongPassword123!",
        confirmPassword: "NewStrongPassword123!",
      }).success,
      true,
    );
    // Short password (< 8 chars)
    assert.strictEqual(
      resetPasswordSchema.safeParse({
        token: "abcdef123456",
        password: "short",
        confirmPassword: "short",
      }).success,
      false,
    );
    // Mismatched passwords
    assert.strictEqual(
      resetPasswordSchema.safeParse({
        token: "abcdef123456",
        password: "NewStrongPassword123!",
        confirmPassword: "DifferentPassword123!",
      }).success,
      false,
    );
    console.log("✅ Test 2 Passed: Zod schemas enforce valid inputs and password requirements.\n");

    // -------------------------------------------------------------
    // Test 3: React Email Template Rendering & Resend Dispatch
    // -------------------------------------------------------------
    console.log("Test 3: PasswordResetEmail template rendering and email service");
    let capturedResendPayload: any = null;
    resend.emails.send = (async (payload: any) => {
      capturedResendPayload = payload;
      return {
        data: { id: "resend_test_pwd_reset_123" },
        error: null,
      };
    }) as any;

    const emailInput: SendPasswordResetEmailInput = {
      to: "creator@example.com",
      userName: "Alex",
      resetUrl: "http://localhost:3000/reset-password?token=secret-token-12345",
      expiresInMinutes: 60,
    };

    const sendResult = await sendPasswordResetEmail(emailInput);

    assert.strictEqual(sendResult.id, "resend_test_pwd_reset_123");
    assert.strictEqual(capturedResendPayload.to, "creator@example.com");
    assert.strictEqual(capturedResendPayload.from, "LinkFlow <onboarding@resend.dev>");
    assert.strictEqual(capturedResendPayload.subject, "Reset your LinkFlow password");

    // Check template content
    assert.ok(capturedResendPayload.html.includes("Reset your password"));
    assert.ok(capturedResendPayload.html.includes("Hello Alex,"));
    assert.ok(capturedResendPayload.html.includes("60 minutes (1 hour)"));
    assert.ok(capturedResendPayload.html.includes("http://localhost:3000/reset-password?token=secret-token-12345"));
    assert.ok(capturedResendPayload.text.includes("Reset your LinkFlow password"));
    console.log("✅ Test 3 Passed: PasswordResetEmail template rendered with accurate security notices and CTA.\n");

    // -------------------------------------------------------------
    // Test 4: Asynchronous BullMQ Email Queue
    // -------------------------------------------------------------
    console.log("Test 4: BullMQ password reset email queueing");
    const testUserId = `test-user-${Date.now()}`;
    const job = await enqueuePasswordResetEmail({
      userId: testUserId,
      userName: "Alex",
      email: "alex@example.com",
      resetUrl: "http://localhost:3000/reset-password?token=test-token",
      expiresInMinutes: 60,
    });

    assert.ok(job.id);
    assert.ok(job.id.startsWith(PASSWORD_RESET_EMAIL_JOB_NAME));
    assert.strictEqual(job.name, PASSWORD_RESET_EMAIL_JOB_NAME);
    assert.strictEqual(job.data.email, "alex@example.com");
    await job.remove().catch(() => {});
    console.log("✅ Test 4 Passed: Email queueing correctly dispatches password-reset-email job.\n");

    // -------------------------------------------------------------
    // Test 5: End-to-End Forgot Password & User Enumeration Protection
    // -------------------------------------------------------------
    console.log("Test 5: User enumeration protection for existing and non-existing accounts");
    const testEmail = `pwd-test-${Date.now()}@example.com`;
    const createdUser = await prisma.user.create({
      data: {
        id: testUserId,
        email: testEmail,
        name: "Password Reset User",
        userName: `user_${Date.now()}`,
      },
    });

    try {
      // 5a. Existing user request
      const existingUserResult = await requestPasswordReset(testEmail);
      assert.strictEqual(
        existingUserResult.message,
        "If an account exists for this email, a password reset link has been sent.",
      );

      // Verify token in DB
      const dbTokens = await prisma.passwordResetToken.findMany({
        where: { userId: createdUser.id },
      });
      assert.strictEqual(dbTokens.length, 1);
      assert.strictEqual(dbTokens[0].usedAt, null);
      assert.ok(dbTokens[0].expiresAt > new Date());
      // Ensure raw token was not stored in database (tokenHash is 64 hex chars)
      assert.strictEqual(dbTokens[0].tokenHash.length, 64);

      // 5b. Non-existing user request
      const unknownEmail = `unknown-${Date.now()}@example.com`;
      const unknownUserResult = await requestPasswordReset(unknownEmail);
      assert.strictEqual(
        unknownUserResult.message,
        "If an account exists for this email, a password reset link has been sent.",
      );
      console.log("✅ Test 5 Passed: Identical generic responses returned, preventing user enumeration.\n");

      // -------------------------------------------------------------
      // Test 6: Invalidation of Previous Active Tokens on New Request
      // -------------------------------------------------------------
      console.log("Test 6: Invalidation of prior active reset tokens upon new reset request");
      await requestPasswordReset(testEmail);
      const allTokens = await prisma.passwordResetToken.findMany({
        where: { userId: createdUser.id },
        orderBy: { createdAt: "asc" },
      });
      assert.strictEqual(allTokens.length, 2);
      assert.notStrictEqual(allTokens[0].usedAt, null); // Previous token invalidated
      assert.strictEqual(allTokens[1].usedAt, null); // New token active
      console.log("✅ Test 6 Passed: Prior active tokens automatically invalidated.\n");

      // -------------------------------------------------------------
      // Test 7: Token Verification (Valid, Expired, Used)
      // -------------------------------------------------------------
      console.log("Test 7: Token verification (valid, expired, already used, non-existent)");
      const activeRawToken = generateSecureToken(32);
      const activeHash = hashToken(activeRawToken);
      await prisma.passwordResetToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: activeHash,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour future
        },
      });

      // Valid token check
      const verifySuccess = await verifyPasswordResetToken(activeRawToken);
      assert.strictEqual(verifySuccess.valid, true);

      // Expired token check
      const expiredRawToken = generateSecureToken(32);
      const expiredHash = hashToken(expiredRawToken);
      await prisma.passwordResetToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: expiredHash,
          expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute in the past
        },
      });

      let expiredCaught = false;
      try {
        await verifyPasswordResetToken(expiredRawToken);
      } catch (err: any) {
        expiredCaught = true;
        assert.strictEqual(err.code, "INVALID_OR_EXPIRED_TOKEN");
      }
      assert.strictEqual(expiredCaught, true);

      // Used token check
      const usedRawToken = generateSecureToken(32);
      const usedHash = hashToken(usedRawToken);
      await prisma.passwordResetToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: usedHash,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          usedAt: new Date(),
        },
      });

      let usedCaught = false;
      try {
        await verifyPasswordResetToken(usedRawToken);
      } catch (err: any) {
        usedCaught = true;
        assert.strictEqual(err.code, "INVALID_OR_EXPIRED_TOKEN");
      }
      assert.strictEqual(usedCaught, true);

      // Non-existent token check
      let nonExistentCaught = false;
      try {
        await verifyPasswordResetToken("00000000000000000000000000000000");
      } catch (err: any) {
        nonExistentCaught = true;
        assert.strictEqual(err.code, "INVALID_OR_EXPIRED_TOKEN");
      }
      assert.strictEqual(nonExistentCaught, true);
      console.log("✅ Test 7 Passed: Verification strictly accepts valid tokens and rejects expired/used/missing ones.\n");

      // -------------------------------------------------------------
      // Test 8: Successful Password Reset, Session Revocation & Better-Auth Verification
      // -------------------------------------------------------------
      console.log("Test 8: Successful password reset, Better-Auth password hashing & session revocation");
      // Create a test active session for this user to verify revocation
      await prisma.session.create({
        data: {
          id: `test-session-${Date.now()}`,
          userId: createdUser.id,
          token: `session-token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400 * 1000),
        },
      });

      const userSessionsBefore = await prisma.session.findMany({
        where: { userId: createdUser.id },
      });
      assert.strictEqual(userSessionsBefore.length, 1);

      const newPasswordText = "SuperSecureNewPassword2026!";
      const resetResult = await resetPasswordWithToken(
        activeRawToken,
        newPasswordText,
        "127.0.0.1",
      );
      assert.strictEqual(resetResult.success, true);

      // Verify sessions are completely deleted
      const userSessionsAfter = await prisma.session.findMany({
        where: { userId: createdUser.id },
      });
      assert.strictEqual(userSessionsAfter.length, 0);

      // Verify updated credential password in Account table
      const accounts = await prisma.account.findMany({
        where: { userId: createdUser.id },
      });
      const credentialAccount = accounts.find((a) => a.providerId === "credential");
      assert.ok(credentialAccount?.password);

      // Verify Better-Auth hash validity with verifyPassword
      const isValidPassword = await verifyPassword({
        hash: credentialAccount.password!,
        password: newPasswordText,
      });
      assert.strictEqual(isValidPassword, true);

      // Verify token is now marked used
      const consumedToken = await prisma.passwordResetToken.findUnique({
        where: { tokenHash: activeHash },
      });
      assert.notStrictEqual(consumedToken?.usedAt, null);
      console.log("✅ Test 8 Passed: Password reset updated credentials, revoked active sessions, and marked token used.\n");

      // -------------------------------------------------------------
      // Test 9: Token Reuse Prevention
      // -------------------------------------------------------------
      console.log("Test 9: Token cannot be reused after successful consumption");
      let reuseCaught = false;
      try {
        await resetPasswordWithToken(
          activeRawToken,
          "AnotherPassword123!",
          "127.0.0.1",
        );
      } catch (err: any) {
        reuseCaught = true;
        assert.strictEqual(err.code, "INVALID_OR_EXPIRED_TOKEN");
      }
      assert.strictEqual(reuseCaught, true);
      console.log("✅ Test 9 Passed: Reusing a consumed token is strictly rejected.\n");

      // -------------------------------------------------------------
      // Test 10: Atomic Concurrency & Race Condition Test
      // -------------------------------------------------------------
      console.log("Test 10: Concurrent password reset requests using the same token (race condition test)");
      const raceRawToken = generateSecureToken(32);
      const raceHash = hashToken(raceRawToken);
      await prisma.passwordResetToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: raceHash,
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });

      // Fire two simultaneous reset requests with the same token
      const [attempt1, attempt2] = await Promise.allSettled([
        resetPasswordWithToken(raceRawToken, "PasswordCandidateOne123!", "127.0.0.1"),
        resetPasswordWithToken(raceRawToken, "PasswordCandidateTwo123!", "127.0.0.1"),
      ]);

      const successCount = [attempt1, attempt2].filter(
        (a) => a.status === "fulfilled",
      ).length;
      const failureCount = [attempt1, attempt2].filter(
        (a) => a.status === "rejected",
      ).length;

      assert.strictEqual(successCount, 1);
      assert.strictEqual(failureCount, 1);
      console.log("✅ Test 10 Passed: Under concurrent load, exactly one request succeeds and the other is rejected.\n");
    } finally {
      // Cleanup created user & relations
      await prisma.user.delete({ where: { id: createdUser.id } }).catch(() => {});
    }

    console.log("🎉 ALL PASSWORD RESET TESTS PASSED SUCCESSFULLY!\n");
  } finally {
    resend.emails.send = originalSend;
    await emailQueue.close().catch(() => {});
  }
}

runPasswordResetTestSuite().catch((err) => {
  console.error("❌ Password reset test suite failed:", err);
  process.exit(1);
});
