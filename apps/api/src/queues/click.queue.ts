import { Queue } from "bullmq";
import { redis } from "../lib/redis.ts";

export const clickQueue = new Queue("click-tracking", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 5000,
    },
  },
});
