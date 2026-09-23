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

export async function requestPasswordReset(email: string, _ipAddress?: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {

    const dummyToken = generateSecureToken(32);
    hashToken(dummyToken);
    console.log(`[PasswordReset] Reset requested for non-existent email: ${normalizedEmail}`);
    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

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

  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${appBaseUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

  try {
    const resolvedUserName = user.userName || user.name || "Creator";
    await enqueuePasswordResetEmail({
      userId: user.id,
      userName: resolvedUserName,
      email: user.email,
      resetUrl,
      expiresInMinutes: 60,
    });
    console.log(`[PasswordReset] Enqueued password reset email for user ${user.id}`);
  } catch (error) {
    console.error(`[PasswordReset] Failed to enqueue reset email for user ${user.id}:`, error);
  }

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
}

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

  return await prisma.$transaction(async (tx) => {

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

    const hashedPassword = await hashPassword(newPassword);

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

    await tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    await tx.session.deleteMany({
      where: { userId },
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

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

    console.log(`[PasswordReset] Password reset successfully for user ${userId}`);

    return {
      success: true,
      message:
        "Password has been reset successfully. Please sign in with your new password.",
    };
  });
}
