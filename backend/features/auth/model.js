import { userRoleEnum } from "../../config/enum.js";
import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      tirm: true,
    },
    userName: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(userRoleEnum),
      default: userRoleEnum.EMPLOYEE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const authModel = mongoose.model("user", authSchema);
export default authModel;
