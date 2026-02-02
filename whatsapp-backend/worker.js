import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { connectDB } from "./db.js";
import Log from "./models/Log.js";
import Settings from "./models/Settings.js";
import { sendWhatsAppMessage } from "./services/whatsapp.service.js";

await connectDB();

/* -------- HELPER -------- */
function isNewDay(lastReset) {
  if (!lastReset) return true;
  const last = new Date(lastReset).toDateString();
  const now = new Date().toDateString();
  return last !== now;
}

new Worker(
  "whatsappQueue",
  async (job) => {
    const { phone, message } = job.data;
    const settings = await Settings.findOne();

    /* -------- CONFIG GUARD -------- */
    if (
      !settings ||
      !settings.evolutionApiUrl ||
      !settings.evolutionApiKey ||
      !settings.instanceName
    ) {
      throw new Error("Evolution API not fully configured in settings");
    }

    /* -------- PAUSE CHECK -------- */
    if (settings.paused) {
      throw new Error("Campaign paused by user");
    }

    /* -------- DAILY LIMIT -------- */
    if (isNewDay(settings.lastReset)) {
      settings.sentToday = 0;
      settings.lastReset = new Date();
      await settings.save();
    }

    if (settings.sentToday >= settings.dailyLimit) {
      throw new Error("Daily message limit reached");
    }

    /* -------- HUMAN DELAY -------- */
    const base = (settings.delaySeconds || 3) * 1000;
    const jitter = (settings.jitterSeconds || 2) * 1000;
    const humanDelay =
      base + Math.floor(Math.random() * jitter * 2) - jitter;

    await new Promise((r) =>
      setTimeout(r, Math.max(1000, humanDelay))
    );

    console.log("Sending to:", phone);

    /* -------- SEND MESSAGE (SAFE) -------- */
    try {
      const result = await sendWhatsAppMessage({
        to: phone,
        message,
        settings,
      });

      console.log("Evolution response:", result);

      await Log.create({
        phone,
        status: "sent",
      });

      settings.sentToday += 1;
      await settings.save();

    } catch (err) {
      console.error(
        "WhatsApp send failed:",
        err.response?.data || err.message
      );

      await Log.create({
        phone,
        status: "failed",
        error: err.response?.data?.message || err.message,
      });

      throw err;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);