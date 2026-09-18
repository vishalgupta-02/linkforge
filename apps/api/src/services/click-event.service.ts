
import type { Request } from "express";

import { clickQueue } from "../queues/click.queue.ts";

type TrackClickInput = {
  linkId?: string;
  socialLinkId?: string;
  userId: string;
  req: Request;
};

export const enqueueClickEvent = async ({
  linkId,
  socialLinkId,
  userId,
  req,
}: TrackClickInput) => {
  const rawReferrer =
    typeof req.headers.referer === "string" ? req.headers.referer : undefined;

  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"]
      : "";

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "127.0.0.1";

  await clickQueue.add(
    "track-click",

    {
      linkId: linkId || null,
      socialLinkId: socialLinkId || null,
      userId,

      rawReferrer,
      userAgent,
      ipAddress,
    },

    {

      attempts: 3,

      backoff: {
        type: "exponential",

        delay: 1000,
      },

      removeOnComplete: 1000,

      removeOnFail: 5000,
    },
  );
};
