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
    try {
      const aggregatedResult = await commentModel.aggregate([
        {
          // Stage 1: Perform a $lookup to join with the "likeunlikecomments" collection
          $lookup: {
            from: "likeunlikecomments", // Specify the model name to join
            localField: "like", // Specify the local key name to match
            foreignField: "_id", // Specify the foreign key in "likeunlikecomments"
            as: "likes", // Specify the alias for the joined result
          },
        },
        {
          // Stage 2: Perform a $lookup to join with the "replycomments" collection
          $lookup: {
            from: "replycomments",
            localField: "reply",
            foreignField: "_id", // Specify the foreign key in "replycomments"
            as: "replyComment",
          },
        },
        {
          // Stage 3: Project the desired fields from the aggregated result
          $project: {
            _id: 1,
            project: 1,
            likes: {
              // Map the "likes" array to extract relevant information
              $map: {
                input: "$likes",
                as: "likes",
                in: {
                  user: "$$likes.userId", // Extract the "userId" from the "likes" array
                },
              },
            },
            reply: {
              $map: {
                input: "$replyComment",
                as: "replyComment",
                in: {
                  reply: "$$replyComment.reply",
                },
              },
            },
          },
        },
      ]);
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
}

export default controller;
