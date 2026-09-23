import type { Request, Response } from "express";
import { getLinkByPublicId } from "../../services/link.service.ts";
import { getSocialLinkByPublicId } from "../../services/social.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";
import { isValidPublicId } from "../../utils/public-id.ts";
import { isSafeDestinationUrl } from "../../validators/link.validator.ts";
import { logger } from "../../lib/logger.ts";
import { resolveDeepLink, generateDeepLinkTrampolineHtml } from "../../utils/deep-link.ts";

export const publicRedirectController = async (req: Request, res: Response) => {
  const { publicId } = req.params;

  if (!publicId || !isValidPublicId(publicId)) {
    return res.status(400).json({
      message: "Invalid redirect identifier",
    });
  }

  const userAgent = req.headers["user-agent"] || "";
  const acceptsHtml = req.headers.accept?.includes("text/html") ?? true;
  const disableDeepLink = req.query.no_deep_link === "1" || req.query.no_deep_link === "true";

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

    if (!disableDeepLink && acceptsHtml) {
      const deepLink = resolveDeepLink(link.url, userAgent);
      if (deepLink.isMobile && deepLink.appScheme && deepLink.platformName) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          generateDeepLinkTrampolineHtml(
            deepLink.appScheme,
            deepLink.fallbackUrl,
            deepLink.platformName,
          ),
        );
      }
    }

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

    if (!disableDeepLink && acceptsHtml && !formattedUrl.startsWith("mailto:")) {
      const deepLink = resolveDeepLink(formattedUrl, userAgent);
      if (deepLink.isMobile && deepLink.appScheme && deepLink.platformName) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(
          generateDeepLinkTrampolineHtml(
            deepLink.appScheme,
            deepLink.fallbackUrl,
            deepLink.platformName,
          ),
        );
      }
    }

    return res.redirect(302, formattedUrl);
  }

  return res.status(404).json({
    message: "Link not found",
  });
};
