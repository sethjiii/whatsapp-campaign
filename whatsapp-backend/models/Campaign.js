import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  message: String,
  status: String
}, { timestamps: true });

export default mongoose.model("Campaign", CampaignSchema);
