import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // REQUIRED by BullMQ
});

export const messageQueue = new Queue("whatsappQueue", {
  connection,
});
