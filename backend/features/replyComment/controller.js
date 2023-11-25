import replyCommentModel from "./model.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";

class controller {
  /**create reply comment */
  static create = async (req, res) => {
    const { id } = req.params;
    try {
      const { reply } = req.body;
      const result = await replyCommentModel.create({ reply, commentId: id });

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "reply comment create successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get all reply comments */
  static get = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await replyCommentModel.find({ commentId: id });
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "list retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**like reply comments */
  static like = async (req, res) => {
    const { id } = req.params;
    try {
      const userId = req.user._id;
      const result = await replyCommentModel.create({ userId, commentId: id });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "user liked!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete reply comment */
  static delete = async (req, res) => {
    try {
      const result = await replyCommentModel.findByIdAndDelete(req.params.id);

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
