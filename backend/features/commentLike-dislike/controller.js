import likeModel from "./model.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";

class controller {
  /**user like this post */
  static like = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
      // Check if the user has already liked the post
      const existingLike = await likeModel.findOne({ userId, commentId: id });

      if (existingLike) {
        // User has already liked the post, so delete the like to "dislike" it
        await likeModel.findByIdAndDelete(existingLike._id);

        const likeCount = await likeModel
          .find({ commentId: id })
          .countDocuments();
        return successResponse({
          res,
          statusCode: 200,
          data: {
            like: false,
            likeCount: likeCount,
          },
          message: "User disliked!",
        });
      } else {
        const result = await likeModel.create({ userId, commentId: id });

        const likeCount = await likeModel
          .find({ commentId: id })
          .countDocuments();

        return successResponse({
          res,
          statusCode: 200,
          data: {
            like: result,
            likeCount: likeCount,
          },
          message: "User liked!",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**user unlike this post */
  static unlike = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
      const existingLike = await likeModel.findOne({ userId, commentId: id });

      if (existingLike) {
        await likeModel.findByIdAndDelete(existingLike._id);

        const likeCount = await likeModel
          .find({ commentId: id })
          .countDocuments();
        return successResponse({
          res,
          statusCode: 200,
          data: {
            like: false,
            likeCount: likeCount,
          },
          message: "User unliked!",
        });
      } else {
        return successResponse({
          res,
          statusCode: 200,
          data: {
            like: false,
            likeCount: 0,
          },
          message: "User did not like the post to unlike.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get all like count */
  static getLikeCount = async (req, res) => {
    const { id } = req.params;

    try {
      // Find all unique user IDs who liked the post
      const userIds = await likeModel.distinct("userId", { commentId: id });

      // Get the total like count for the post
      const likeCount = userIds.length;

      return successResponse({
        res,
        statusCode: 200,
        data: {
          userIds: userIds,
          likeCount: likeCount,
        },
        message: "Successfully retrieved like count!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
