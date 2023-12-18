import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import notificationModel from "./model.js";

class controller {
  /** get all notifications */
  static get = async (req, res) => {
    try {
      const userId = req.user._id;

      // Fetch unread notifications from the user
      const notifications = await notificationModel.find({
        user: userId,
        isRead: false,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: notifications,
        message: "Unread notification get successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  // Mark a notification as read
  static read = async (req, res) => {
    try {
      const { id } = req.params;

      // Update the notification to mark it as read
      const notification = await notificationModel.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found." });
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "Notification mark as read.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  // Mark all notification as read for a user
  static readNotification = async (req, res) => {
    try {
      const user = req.user._id;

      // Update all unread notification for the user to mark them as read
      await notificationModel.updateMany(
        { user: user, isRead: false },
        { isRead: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        message: "All notification mark as read.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
