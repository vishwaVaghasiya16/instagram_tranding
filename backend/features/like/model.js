import mongoose from "mongoose";

/**like model */

const likeSchema = new mongoose.Schema(
  {
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const likeModel = mongoose.model("like", likeSchema);
export default likeModel;
