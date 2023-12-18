import mongoose from "mongoose";

/**group chat schema */
const groupChatSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const groupChatModel = mongoose.model("groupChat", groupChatSchema);
export default groupChatModel;
