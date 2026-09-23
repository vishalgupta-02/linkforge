import type { Request, Response } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../../db/client.ts";
import { sendMobileWaitlistEmail } from "../../services/email.service.ts";
import { logger } from "../../lib/logger.ts";

const BASE_WAITLIST_OFFSET = 1420;

let tableEnsured = false;
async function ensureWaitlistTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS mobile_waitlist (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        platform VARCHAR(32) NOT NULL DEFAULT 'all',
        waitlist_number INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableEnsured = true;
  } catch (err: unknown) {
    logger.error("Failed to ensure mobile_waitlist table", { err });
  }
}

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  platform: z.enum(["ios", "android", "all"]).optional().default("all"),
});

export const subscribeMobileWaitlist = async (req: Request, res: Response) => {
  try {
    await ensureWaitlistTable();

    const parseResult = subscribeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message || "Invalid input data",
      });
    }

    const { email, platform } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing: Array<{ id: string; email: string; platform: string; waitlist_number: number }> =
      await prisma.$queryRawUnsafe(
        `SELECT id, email, platform, waitlist_number FROM mobile_waitlist WHERE email = $1 LIMIT 1`,
        normalizedEmail,
      );

    if (existing && existing.length > 0) {
      const current = existing[0];
      const countResult: Array<{ count: string | number }> = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM mobile_waitlist`,
      );
      const totalCount = Number(countResult[0]?.count || 0) + BASE_WAITLIST_OFFSET;

      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        waitlistNumber: current.waitlist_number,
        totalSubscribers: totalCount,
        email: normalizedEmail,
        message: `You're already on the waitlist as #${current.waitlist_number}!`,
      });
    }

    // Get current count for next number
    const countResult: Array<{ count: string | number }> = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM mobile_waitlist`,
    );
    const rawCount = Number(countResult[0]?.count || 0);
    const assignedNumber = BASE_WAITLIST_OFFSET + rawCount + 1;
    const id = crypto.randomUUID();

    await prisma.$executeRawUnsafe(
      `INSERT INTO mobile_waitlist (id, email, platform, waitlist_number, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      id,
      normalizedEmail,
      platform,
      assignedNumber,
    );

    // Send confirmation email asynchronously via Resend
    sendMobileWaitlistEmail({
      email: normalizedEmail,
      waitlistNumber: assignedNumber,
      platform,
    }).catch((emailError) => {
      logger.warn("Non-fatal: failed to send waitlist email", { emailError });
    });

    return res.status(201).json({
      success: true,
      alreadyRegistered: false,
      waitlistNumber: assignedNumber,
      totalSubscribers: assignedNumber,
      email: normalizedEmail,
      message: `You're #${assignedNumber} on the LinkForge Mobile waitlist! Check your inbox for confirmation.`,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal server error";
    logger.error("Error subscribing to mobile waitlist", { error });
    return res.status(500).json({
      success: false,
      message: "Unable to join the waitlist right now. Please try again in a few moments.",
      error: errMessage,
    });
  }
};

export const getMobileWaitlistStats = async (req: Request, res: Response) => {
  try {
    await ensureWaitlistTable();

    const countResult: Array<{ count: string | number }> = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM mobile_waitlist`,
    );
    const rawCount = Number(countResult[0]?.count || 0);
    const totalCount = BASE_WAITLIST_OFFSET + rawCount;

    return res.status(200).json({
      success: true,
      totalSubscribers: totalCount,
    });
  } catch (error: unknown) {
    logger.error("Error fetching mobile waitlist stats", { error });
    return res.status(200).json({
      success: true,
      totalSubscribers: BASE_WAITLIST_OFFSET,
    });
  }
};
