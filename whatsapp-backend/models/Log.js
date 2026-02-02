 import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  phone: String,
  status: String,
  error: String
}, { timestamps: true });

export default mongoose.model("Log", LogSchema);
