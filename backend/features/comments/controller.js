import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import commentModel from "./model.js";

class controller {
  /**create comment */
  static createComment = async (req, res) => {
    const { id } = req.params;
    try {
      const userId = req.user._id;
      const { comment, like, reply } = req.body;
      const result = await commentModel.create({
        comment,
        userId,
        postId: id,
        like,
        reply,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "comments upload successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get all comments */
  static getAllComments = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await commentModel
        .find({ postId: id })
        .populate({ path: "like", select: "userId" })
        .populate({ path: "reply", select: "reply userId" });
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Comments list retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete comments */
  static deleteComments = async (req, res) => {
    try {
      const result = await commentModel.findByIdAndDelete(req.params.id);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "comment deleted!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
