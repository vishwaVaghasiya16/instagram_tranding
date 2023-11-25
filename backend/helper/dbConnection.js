import mongoose from "mongoose";
import { MONGODB_URL } from "../config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      dbName: "instagram",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection established");
  } catch (error) {
    console.log(`Error connecting to Mongo`, error);
  }
};

export default connectDB;
