import mongoose, { mongo } from "mongoose";

/**reply like-unliked comments */
const likeUnlikeSchema = new mongoose.Schema(
  {
    replyCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "replyComment",
    },
    userId: [
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

const likeReply = mongoose.model("likeReply", likeUnlikeSchema);
export default likeReply;