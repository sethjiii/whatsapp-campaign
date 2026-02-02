import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "whatsapp_campaign"
  });
  console.log("MongoDB connected");
};
