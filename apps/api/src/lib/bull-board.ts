import { createBullBoard } from "@bull-board/api";

import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { ExpressAdapter } from "@bull-board/express";

import { clickQueue } from "../queues/click.queue.ts";

// 🔥 Express adapter
const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

// 🔥 Create board
createBullBoard({
  queues: [new BullMQAdapter(clickQueue)],

  serverAdapter,
});

export { serverAdapter };
