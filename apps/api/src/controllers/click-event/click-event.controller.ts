import type { Request, Response } from "express";

import { getLinkById } from "../../services/link.service.ts";
import { enqueueClickEvent } from "../../services/click-event.service.ts";

export const redirectController = async (req: Request, res: Response) => {
  const start = performance.now();

  const { linkId } = req.params;

  if (!linkId) {
    return res.status(400).json({
      message: "Invalid link",
    });
  }

  const link = await getLinkById(linkId);

  if (!link || !link.isActive) {
    return res.status(404).json({
      message: "Link not found",
    });
  }

  // 🔥 async event recording
  enqueueClickEvent({
    linkId: link.id,
    userId: link.userId,
    req,
  });

  const end = performance.now();

  console.log(`Redirect latency: ${(end - start).toFixed(2)}ms`);

  return res.redirect(302, link.url);
};
