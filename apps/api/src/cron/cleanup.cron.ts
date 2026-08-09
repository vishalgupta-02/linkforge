import cron from "node-cron";
import { prisma } from "../db/client.ts";

export const startCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 Running cleanup job...");

    const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await prisma.link.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: THIRTY_DAYS_AGO,
        },
      },
    });

    console.log("✅ Old deleted links removed");
  });
};
