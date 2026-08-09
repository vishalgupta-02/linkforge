import { clickQueue } from "../queues/click.queue.ts";

export const getFailedJobs = async () => {
  const failedJobs = await clickQueue.getFailed();

  return failedJobs.map((job) => ({
    id: job.id,

    name: job.name,

    data: job.data,

    failedReason: job.failedReason,

    attemptsMade: job.attemptsMade,

    timestamp: job.timestamp,

    finishedOn: job.finishedOn,
  }));
};
