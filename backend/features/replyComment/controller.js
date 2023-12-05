import replyCommentModel from "./model.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";

class controller {
  /**create reply comment */
  static create = async (req, res) => {
    const { id } = req.params;
    try {
      const userId = req.user._id;
      const { reply } = req.body;
      const result = await replyCommentModel.create({
        userId,
        reply,
        commentId: id,
      });

      console.log(result);

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

  /**delete reply comment */
  static delete = async (req, res) => {
    try {
      await replyCommentModel.findByIdAndDelete(req.params.id);

      return successResponse({
        res,
        statusCode: 200,
        message: "comment deleted!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**like reply */
  static like = async (req, res) => {
    try {
      const reply = await replyCommentModel.findById(req.params.id);
      if (!reply.like.includes(req.user._id)) {
        await replyCommentModel.updateOne(
          { _id: req.params.id },
          { $push: { like: req.user._id } }
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "User is liked.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**unlike reply */
  static unlike = async (req, res) => {
    try {
      const reply = await replyCommentModel.findById(req.params.id);
      if (reply.like.includes(req.user._id)) {
        await replyCommentModel.updateOne(
          { _id: req.params.id },
          { $pull: { like: req.user._id } }
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "User is unliked.",
        });
      } else {
        return successResponse({
          res,
          statusCode: 200,
          message: "User was not liked before.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
