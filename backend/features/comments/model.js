import mongoose, { mongo } from "mongoose";

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
      ref: "user",
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

const commentModel = mongoose.model("comment", commentSchema);
export default commentModel;
