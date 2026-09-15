import type { Request, Response } from "express";

import { getLinkById, getLinkByPublicId } from "../../services/link.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";
import { isSafeDestinationUrl } from "../../validators/link.validator.ts";
import { logger } from "../../lib/logger.ts";

/**
 * Legacy Redirect Controller: GET /api/v1/r/:linkId & GET /api/v1/redirect/:linkId
 * Maintained for backward-compatibility with previously shared or indexed links.
 */
export const redirectController = async (req: Request, res: Response) => {
  const { linkId } = req.params;

  if (!linkId) {
    return res.status(400).json({
      message: "Invalid link identifier",
    });
  }

  // Try finding by internal ID first (legacy UUID), then by publicId
  let link = await getLinkById(linkId);
  if (!link) {
    link = await getLinkByPublicId(linkId);
  }

  if (!link || !link.isActive || link.deletedAt !== null) {
    return res.status(404).json({
      message: "Link not found",
    });
  }

  if (!isSafeDestinationUrl(link.url)) {
    logger.warn("Unsafe destination URL blocked in legacy redirect flow", {
      event: "legacy_redirect.unsafe_url_blocked",
      linkId,
    });
    return res.status(400).json({
      message: "Invalid destination URL",
    });
  }

  // Async event recording via BullMQ
  enqueueClickEvent({
    linkId: link.id,
    userId: link.userId,
    req,
  });

  return res.redirect(302, link.url);
};

