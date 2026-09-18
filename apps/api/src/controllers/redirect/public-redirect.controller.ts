import type { Request, Response } from "express";
import { getLinkByPublicId } from "../../services/link.service.ts";
import { getSocialLinkByPublicId } from "../../services/social.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";
import { isValidPublicId } from "../../utils/public-id.ts";
import { isSafeDestinationUrl } from "../../validators/link.validator.ts";
import { logger } from "../../lib/logger.ts";

export const publicRedirectController = async (req: Request, res: Response) => {
  const { publicId } = req.params;

  if (!publicId || !isValidPublicId(publicId)) {
    return res.status(400).json({
      message: "Invalid redirect identifier",
    });
  }

  const link = await getLinkByPublicId(publicId);

  if (link && link.isActive && link.deletedAt === null) {
    if (!isSafeDestinationUrl(link.url)) {
      logger.warn("Unsafe destination URL blocked in redirect flow", {
        event: "redirect.unsafe_url_blocked",
        publicId,
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
  }

  const social = await getSocialLinkByPublicId(publicId);

  if (social && social.isActive && social.deletedAt === null) {
    const formattedUrl = social.url.startsWith("mailto:")
      ? social.url
      : social.url.startsWith("http://") || social.url.startsWith("https://")
        ? social.url
        : `https://${social.url}`;

    if (!social.url.startsWith("mailto:") && !isSafeDestinationUrl(formattedUrl)) {
      logger.warn("Unsafe social destination URL blocked in redirect flow", {
        event: "redirect.unsafe_social_url_blocked",
        publicId,
      });
      return res.status(400).json({
        message: "Invalid destination URL",
      });
    }

    enqueueClickEvent({
      socialLinkId: social.id,
      userId: social.userId,
      req,
    });

    return res.redirect(302, formattedUrl);
  }

  return res.status(404).json({
    message: "Link not found",
  });
};
