import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  name: String
});

export default mongoose.model("Contact", ContactSchema);
