import { prisma } from "../db/client.ts";
import { generatePublicId } from "../utils/public-id.ts";
import { logger } from "../lib/logger.ts";

export async function backfillPublicIds(): Promise<{ total: number; updated: number }> {
  const unbackfilledLinks = await prisma.link.findMany({
    where: {
      OR: [
        { publicId: null },
        { publicId: "" },
      ],
    },
    select: {
      id: true,
    },
  });

  const total = unbackfilledLinks.length;
  if (total === 0) {
    logger.info("Public ID backfill: All links already have unique public IDs. Nothing to do.", {
      event: "backfill.public_ids.skipped",
      total: 0,
    });
    return { total: 0, updated: 0 };
  }

  logger.info(`Starting Public ID backfill for ${total} links...`, {
    event: "backfill.public_ids.started",
    count: total,
  });

  let updatedCount = 0;

  for (const link of unbackfilledLinks) {
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!success && attempts < maxAttempts) {
      attempts++;
      const candidatePublicId = generatePublicId();

      try {
        await prisma.link.update({
          where: { id: link.id },
          data: { publicId: candidatePublicId },
        });
        success = true;
        updatedCount++;
      } catch (err: any) {
        if (err?.code === "P2002" && attempts < maxAttempts) {

          logger.warn("Public ID collision encountered during backfill, retrying...", {
            event: "backfill.public_ids.collision_retry",
            linkId: link.id,
            attempt: attempts,
          });
        } else {
          logger.error("Failed to backfill publicId for link", {
            event: "backfill.public_ids.error",
            linkId: link.id,
          }, err);
          throw err;
        }
      }
    }
  }

  logger.info(`Public ID backfill completed successfully. Updated ${updatedCount}/${total} links.`, {
    event: "backfill.public_ids.completed",
    total,
    updated: updatedCount,
  });

  return { total, updated: updatedCount };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("backfill-public-ids.ts")) {
  backfillPublicIds()
    .then((result) => {
      console.log(`✅ Backfill complete: ${result.updated} of ${result.total} links updated.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Backfill failed:", err);
      process.exit(1);
    });
}
