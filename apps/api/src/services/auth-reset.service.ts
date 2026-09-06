import { prisma } from "../db/client.ts";
import { generateSecureToken, hashToken } from "../utils/token.utils.ts";
import { hashPassword } from "better-auth/crypto";
import { enqueuePasswordResetEmail } from "../queues/email.queue.ts";
import { AppError } from "../utils/api-error.ts";

const appBaseUrl =
  process.env.FRONTEND_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "http://localhost:3000";

/**
 * Initiates the password reset flow.
 * Returns a generic success response to prevent user enumeration.
 */
export async function requestPasswordReset(email: string, _ipAddress?: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Constant-time simulation to mitigate timing attacks / user enumeration
    const dummyToken = generateSecureToken(32);
    hashToken(dummyToken);
    console.log(`🔒 [PasswordReset] Reset requested for non-existent email: ${normalizedEmail}`);
    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

  // Invalidate any existing active/unused reset tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate a cryptographically secure 32-byte token
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

  // Persist only the token hash in the database
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  // Construct secure frontend reset URL
  const resetUrl = `${appBaseUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

  // Asynchronously enqueue BullMQ password-reset email job
  try {
    const resolvedUserName = user.userName || user.name || "Creator";
    await enqueuePasswordResetEmail({
      userId: user.id,
      userName: resolvedUserName,
      email: user.email,
      resetUrl,
      expiresInMinutes: 60,
    });
    console.log(`✉️ [PasswordReset] Enqueued password reset email for user ${user.id}`);
  } catch (error) {
    console.error(`❌ [PasswordReset] Failed to enqueue reset email for user ${user.id}:`, error);
  }

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
}

/**
 * Validates a password reset token.
 * Returns valid status or throws a safe generic error.
 */
export async function verifyPasswordResetToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new AppError(
      "This password reset link is invalid or has expired.",
      400,
      "INVALID_OR_EXPIRED_TOKEN",
    );
  }

  const tokenHash = hashToken(rawToken.trim());

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !tokenRecord ||
    tokenRecord.usedAt !== null ||
    tokenRecord.expiresAt < new Date()
  ) {
    throw new AppError(
      "This password reset link is invalid or has expired.",
      400,
      "INVALID_OR_EXPIRED_TOKEN",
    );
  }

  return { valid: true };
}

/**
 * Atomically consumes a reset token and updates the user's password.
 * Invalidates old sessions and prevents race conditions / token reuse.
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
  ipAddress?: string,
) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new AppError(
      "This password reset link is invalid or has expired.",
      400,
      "INVALID_OR_EXPIRED_TOKEN",
    );
  }

  const tokenHash = hashToken(rawToken.trim());
  const now = new Date();

  // Execute inside an atomic transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Conditional atomic claim of the token
    const updateResult = await tx.passwordResetToken.updateMany({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        usedAt: now,
      },
    });

    if (updateResult.count === 0) {
      throw new AppError(
        "This password reset link is invalid or has expired.",
        400,
        "INVALID_OR_EXPIRED_TOKEN",
      );
    }

    const tokenRecord = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new AppError(
        "This password reset link is invalid or has expired.",
        400,
        "INVALID_OR_EXPIRED_TOKEN",
      );
    }

    const userId = tokenRecord.userId;

    // 2. Hash password using Better Auth's standard password hasher
    const hashedPassword = await hashPassword(newPassword);

    // 3. Update credential account password or create if not present
    const existingAccounts = await tx.account.findMany({
      where: { userId },
    });
    const credentialAccount = existingAccounts.find(
      (a) => a.providerId === "credential",
    );

    if (credentialAccount) {
      await tx.account.update({
        where: { id: credentialAccount.id },
        data: {
          password: hashedPassword,
          updatedAt: now,
        },
      });
    } else {
      await tx.account.create({
        data: {
          id: `${userId}-credential-${Date.now()}`,
          userId,
          accountId: userId,
          providerId: "credential",
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    // Also update User.password
    await tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // 4. Invalidate all active sessions for this user
    await tx.session.deleteMany({
      where: { userId },
    });

    // 5. Invalidate any other active reset tokens for this user
    await tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    // 6. Record audit log
    await tx.auditlog.create({
      data: {
        userId,
        action: "PASSWORD_RESET" as any,
        metadata: {
          source: "forgot_password_flow",
          timestamp: now.toISOString(),
        },
        ipAddress: ipAddress || "unknown",
      },
    });

    console.log(`✅ [PasswordReset] Password reset successfully for user ${userId}`);

    return {
      success: true,
      message:
        "Password has been reset successfully. Please sign in with your new password.",
    };
  });
}
