import type { Request, Response } from "express";
import { getLinkByPublicId } from "../../services/link.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";
import { isValidPublicId } from "../../utils/public-id.ts";
import { isSafeDestinationUrl } from "../../validators/link.validator.ts";
import { logger } from "../../lib/logger.ts";

/**
 * Public Redirect Controller: GET /r/:publicId
 * Resolves the destination URL from a cryptographically secure public ID,
 * queues an asynchronous click event, and issues an immediate HTTP 302 redirect.
 */
export const publicRedirectController = async (req: Request, res: Response) => {
  const { publicId } = req.params;

  // 1. Boundary validation of route parameter format
  if (!publicId || !isValidPublicId(publicId)) {
    return res.status(400).json({
      message: "Invalid redirect identifier",
    });
  }

  // 2. Resolve link from cache or database
  const link = await getLinkByPublicId(publicId);

  if (!link || !link.isActive || link.deletedAt !== null) {
    return res.status(404).json({
      message: "Link not found",
    });
  }

  // 3. Validate destination URL protocol safety (prevent javascript:, data:, vbscript:)
  if (!isSafeDestinationUrl(link.url)) {
    logger.warn("Unsafe destination URL blocked in redirect flow", {
      event: "redirect.unsafe_url_blocked",
      publicId,
    });
    return res.status(400).json({
      message: "Invalid destination URL",
    });
  }

  // 4. Asynchronous click tracking via BullMQ queue (uses internal link.id and link.userId)
  enqueueClickEvent({
    linkId: link.id,
    userId: link.userId,
    req,
  });

  // 5. Immediate HTTP 302 Redirect to destination
  return res.redirect(302, link.url);
};
