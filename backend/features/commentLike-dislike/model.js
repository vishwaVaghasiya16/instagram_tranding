import mongoose from "mongoose";

/**like-unlike comment schema */
const commentsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    commentId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "comment",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const commentsModel = mongoose.model("like-dislike", commentsSchema);
export default commentsModel;
