import type { Request, Response } from "express";

import { getLinkById, getLinkByPublicId } from "../../services/link.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";
import { isSafeDestinationUrl } from "../../validators/link.validator.ts";
import { logger } from "../../lib/logger.ts";

export const redirectController = async (req: Request, res: Response) => {
  const { linkId } = req.params;

  if (!linkId) {
    return res.status(400).json({
      message: "Invalid link identifier",
    });
  }

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

  enqueueClickEvent({
    linkId: link.id,
    userId: link.userId,
    req,
  });

  return res.redirect(302, link.url);
};
