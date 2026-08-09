import { Queue } from "bullmq";
import { redis } from "../lib/redis.ts";

export const clickQueue = new Queue("click-tracking", {
  connection: redis,
});
