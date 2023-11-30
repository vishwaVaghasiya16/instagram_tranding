import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import reportModel from "./model.js";

class controller {
  /**create report */
  static create = async (req, res) => {
    try {
      const userId = req.user._id;
      const { title, commentId, count } = req.body;
      const result = await reportModel.create({
        title,
        commentId,
        userId,
        count,
      });

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "report created successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "report.create", res, error });
    }
  };

  /**get all reports */
  static get = async (req, res) => {
    try {
      const result = await reportModel.find();
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "report list retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "report.get", res, error });
    }
  };

  /**update reports */
  static update = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await reportModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "report updated!",
      });
    } catch (error) {
      return errorResponse({ funName: "report.update", res, error });
    }
  };

  /**delete reports */
  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      await reportModel.findByIdAndDelete(id);
      return successResponse({
        res,
        statusCode: 200,
        message: "report delete!",
      });
    } catch (error) {
      return errorResponse({ funName: "report.delete", res, error });
    }
  };
}

export default controller;
