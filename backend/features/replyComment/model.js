import mongoose from "mongoose";

/**reply comment model */
const replyCommentSchema = new mongoose.Schema(
  {
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    reply: {
      type: String,
      trim: true,
    },
    like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const replyCommentModel = mongoose.model("replyComment", replyCommentSchema);
export default replyCommentModel;
