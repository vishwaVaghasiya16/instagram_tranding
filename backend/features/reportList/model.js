import mongoose from "mongoose";

/**report reason list */
const reportReasonSchema = new mongoose.Schema(
  {
    reports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "report",
        required: true,
      },
    ],
    other: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const reportReasonModel = mongoose.model("reportReason", reportReasonSchema);
export default reportReasonModel;
