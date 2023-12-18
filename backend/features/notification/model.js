import mongoose from "mongoose";
import { notificationEnum } from "../../config/enum.js";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
    },
    type: {
      type: String,
      enum: Object.values(notificationEnum),
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "reply",
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    accept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    time: {
      type: String,
      default:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const notificationModel = mongoose.model("notification", notificationSchema);

export default notificationModel;
