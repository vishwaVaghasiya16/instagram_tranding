import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import commentModel from "./model.js";

const likedComments = new Map();

class controller {
  /**create comment */
  static createComment = async (req, res) => {
    const { id } = req.params;
    try {
      const userId = req.user._id;
      const userName = req.user.userName;
      const { comment, like } = req.body;
      const result = await commentModel.create({
        userName,
        comment,
        userId,
        postId: id,
        like,
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
    try {
      // const aggregatedResult = await commentModel.aggregate([
      //   {
      //     $lookup: {
      //       from: "user",
      //       localField: "like",
      //       foreignField: "_id",
      //       as: "likes",
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 1,
      //       project: 1,
      //       comment: 1,
      //       postId: 1,
      //       createdAt: 1,
      //       likes: {
      //         $map: {
      //           input: "$likes",
      //           as: "likes",
      //           in: {
      //             user: "$$likes.userId",
      //           },
      //         },
      //       },
      //     },
      //   },
      // ]);

      const aggregatedResult = await commentModel.find();
      return successResponse({
        res,
        statusCode: 200,
        data: aggregatedResult,
        message: "Comments list retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete comments */
  static deleteComments = async (req, res) => {
    try {
      await commentModel.findByIdAndDelete(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        message: "comment deleted!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**like comment */
  static like = async (req, res) => {
    try {
      const comment = await commentModel.findById(req.params.id);
      if (!comment.like.includes(req.user._id)) {
        await commentModel.updateOne(
          { _id: req.params.id },
          {
            $push: { like: req.user._id },
          }
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "Comment is liked.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**unlike comment */
  static unlike = async (req, res) => {
    try {
      const comment = await commentModel.findById(req.params.id);
      if (comment.like.includes(req.user._id)) {
        await commentModel.updateOne(
          { _id: req.params.id },
          {
            $pull: { like: req.user._id },
          }
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "Comment is unliked.",
        });
      } else {
        return successResponse({
          res,
          statusCode: 200,
          message: "Comment was not liked before.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
