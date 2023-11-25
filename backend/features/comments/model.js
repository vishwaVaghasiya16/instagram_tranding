import mongoose from "mongoose";

/**comment api */
const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    reply: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "replyComment",
      },
    ],
    like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "like-dislike",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const commentModel = mongoose.model("comment", commentSchema);
export default commentModel;