import { createBullBoard } from "@bull-board/api";

import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { ExpressAdapter } from "@bull-board/express";

import { clickQueue } from "../queues/click.queue.ts";
import { emailQueue } from "../queues/email.queue.ts";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(clickQueue), new BullMQAdapter(emailQueue)],

  serverAdapter,
});

export { serverAdapter };
