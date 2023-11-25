import { validateResponse } from "./apiResponse.js";
import mongoose from "mongoose";

const errObj = {
  details: [
    {
      path: "data",
      message: "document not found",
    },
  ],
};

/**is exist */
export const isExist = async ({ res, id, Model }) => {
  try {
    const checkId = mongoose.Types.ObjectId.isValid(id);
    if (!checkId) return validateResponse({ res, error: errObj });
    const result = await Model.findById(id);
    if (result === null) {
      return validateResponse({ res, error: errObj });
    }
    return result;
  } catch (error) {
    throw error;
  }
};
