import { genderEnum, statusEnum, userRoleEnum } from "../../config/enum.js";
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
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    request: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(statusEnum),
      default: statusEnum.OFFLINE,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
    },
    name: {
      type: String,
    },
    website: {
      type: String,
    },
    profile: {
      type: String,
    },
    threadingEnabled: {
      type: Boolean,
      default: false,
    },
    isMentionable: {
      type: Boolean,
      default: false,
    },
    bussinessAccount: {
      type: Boolean,
      default: false,
    },
    birthday: {
      type: Date,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.CUSTOM,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const authModel = mongoose.model("user", authSchema);
export default authModel;
