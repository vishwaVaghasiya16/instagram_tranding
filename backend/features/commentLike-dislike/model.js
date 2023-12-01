import mongoose from "mongoose";

/**like-unlike comment schema */
const likeUnlikeCommentSchema = new mongoose.Schema(
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

const likeUnlikeCommentModel = mongoose.model(
  "likeUnlikeComment",
  likeUnlikeCommentSchema
);

export default likeUnlikeCommentModel;
