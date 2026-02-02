import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
    evolutionApiUrl: String,
    evolutionApiKey: String,
    instanceName: String,

    delaySeconds: Number,          // base delay
    jitterSeconds: Number,         // random +/- delay
    paused: { type: Boolean, default: false },

    dailyLimit: { type: Number, default: 1000 },
    sentToday: { type: Number, default: 0 },
    lastReset: Date,
}, { timestamps: true });

export default mongoose.model("Settings", SettingsSchema);
