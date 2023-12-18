import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "user",
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "user",
    },
    room: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: [true, "Message should not be empty"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    time: {
      type: String,
      default:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const chatModel = await mongoose.model("chat", chatSchema);
export default chatModel;
