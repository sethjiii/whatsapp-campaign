import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { connectDB } from "./db.js";
import Contact from "./models/Contact.js";
import Campaign from "./models/Campaign.js";
import Log from "./models/Log.js";
import { messageQueue } from "./queue.js";
import Settings from "./models/Settings.js";
import contactRoutes from "./routes/contacts.js";



dotenv.config();
await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/contacts", contactRoutes);

/* START CAMPAIGN */

app.post("/campaign/start", async (req, res) => {
    const { message } = req.body;

    const campaign = await Campaign.create({
        message,
        status: "running"
    });

    const contacts = await Contact.find();

    for (const c of contacts) {
        const text = message.replace("{{name}}", c.name || "there");
        const delay =
            Math.floor(Math.random() * 2000) + 2000;

        await messageQueue.add("send", {
            phone: c.phone,
            message: text,
            campaignId: campaign._id
        }, { delay });
    }

    res.json({ success: true, queued: contacts.length });
});

app.post("/campaign/pause", async (req, res) => {
    await Settings.findOneAndUpdate(
        {},
        { paused: true },
        { upsert: true }
    );
    res.json({ success: true });
});

app.post("/campaign/resume", async (req, res) => {
    await Settings.findOneAndUpdate(
        {},
        { paused: false },
        { upsert: true }
    );
    res.json({ success: true });
});


app.post("/settings", async (req, res) => {
    const { apiUrl, apiKey, delay, instanceName } = req.body;

    await Settings.findOneAndUpdate(
        {},
        {
            evolutionApiUrl: apiUrl,
            evolutionApiKey: apiKey,
            instanceName,
            delaySeconds: Number(delay),
        },
        { upsert: true, new: true }
    );

    res.json({ success: true });
});

app.get("/settings/test", async (req, res) => {
    const settings = await Settings.findOne();

    if (
        !settings ||
        !settings.evolutionApiUrl ||
        !settings.evolutionApiKey ||
        !settings.instanceName
    ) {
        return res.status(400).json({
            success: false,
            message: "Settings not fully configured",
        });
    }

    const baseUrl = settings.evolutionApiUrl.replace(/\/+$/, "");

    try {
        const response = await axios.get(
            `${baseUrl}/instance/info/${settings.instanceName}`,
            {
                headers: {
                    apikey: settings.evolutionApiKey,
                },
                timeout: 5000,
            }
        );

        return res.json({
            success: true,
            status: response.data?.state || "CONNECTED",
            instance: settings.instanceName,
        });

    } catch (err) {
        return res.status(400).json({
            success: false,
            message:
                err.response?.data?.message ||
                err.response?.statusText ||
                err.message,
        });
    }
});


/* LOGS */
app.get("/logs", async (req, res) => {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
});

/* STATS */
app.get("/stats", async (req, res) => {
    const totalContacts = await Contact.countDocuments();
    const sent = await Log.countDocuments({ status: "sent" });
    const failed = await Log.countDocuments({ status: "failed" });

    res.json({ totalContacts, sent, failed });
});

app.get("/settings", async (req, res) => {
    const settings = await Settings.findOne();
    res.json(settings || {});
});


app.listen(4000, () => {
    console.log("Backend running on port 4000");
});
