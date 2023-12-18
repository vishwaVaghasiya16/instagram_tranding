import mongoose from "mongoose";

/**group schema */
const groupSchema = new mongoose.Schema(
  {
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
    photo: {
      type: String,
    },
    groupName: {
      type: String,
    },
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const groupModel = mongoose.model("group", groupSchema);
export default groupModel;
