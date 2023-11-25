import mongoose from "mongoose";

/**report comment schema */
const reportSchema = new mongoose.Schema(
  {
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "comment",
    },
    title: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const reportModel = mongoose.model("report", reportSchema);
export default reportModel;
