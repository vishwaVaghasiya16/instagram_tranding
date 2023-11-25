import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import reportModel from "../report/model.js";
import reportReasonModel from "./model.js";

class controller {
  /**create report reason */
  static create = async (req, res) => {
    try {
      const { reports, other } = req.body;
      const result = await reportReasonModel.create({ reports, other });

      await reportModel.updateMany(
        { _id: { $in: reports } },
        { $inc: { count: 1 } }
      );

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "report is created successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "reportReason.create", res, error });
    }
  };

  /**get report reason list */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      let filter = {};
      if (id) filter._id = id;
      const result = await reportReasonModel
        .find(filter)
        .populate({ path: "reports", select: "count title" });
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "report reason retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "reportReason.get", res, error });
    }
  };

  /**update report reason api */
  static update = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await reportReasonModel.findByIdAndUpdate(id, {
        $set: req.body,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "report updated!",
      });
    } catch (error) {
      return errorResponse({ funName: "reportReason.update", res, error });
    }
  };

  /**delete report reason api */
  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist({ res, id, Model: reportReasonModel });

      const reportReason = await reportReasonModel.findByIdAndDelete(id);
      return successResponse({
        res,
        statusCode: 200,
        data: reportReason,
        message: "report is deleted successfully!",
      });
    } catch (error) {
      return errorResponse({ funName: "reportReason.delete", res, error });
    }
  };
}

export default controller;
