import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import groupModel from "../group/model.js";
import groupChatModel from "./model.js";
import { io } from "../../index.js";
import notificationModel from "../notification/model.js";

class controller {
  /**create group chate */
  static create = async (req, res) => {
    try {
      const { groupId } = req.params;
      const { message } = req.body;
      const sender = req.user._id;

      io.to(groupId).emit("receive_group_message", {
        sender,
        message,
        time: new Date(),
      });

      // Checking if the sender is a member of the specified group
      const isGroupMember = await groupModel.exists({
        _id: groupId,
        users: { $elemMatch: { user: sender } },
      });

      if (!isGroupMember) {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }

      // for notification
      const notificationData = {
        user: groupId,
        group: groupId,
        message: message,
      };

      // Create and save notification for each group member
      const group = await groupModel.findById(groupId);
      for (const user of group.users) {
        const notification = await notificationModel({
          user: user.user,
          group: notificationData.group,
          message: notificationData.message,
        });

        await notification.save();
      }

      // Creating a new group chat message
      const result = await groupChatModel.create({ message, sender, groupId });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Message created.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get group chat list */
  static list = async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user._id;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = 10;

      // Checking if the user is a member of the specified group
      const isGroupMember = await groupModel.exists({
        _id: groupId,
        users: { $elemMatch: { user: userId } },
      });

      if (!isGroupMember) {
        return res.status(401).json({
          success: false,
          message: "Access denied.",
        });
      }

      const skipCount = (page - 1) * limit;
      const totalItems = await groupChatModel.countDocuments({ groupId });
      const totalPages = Math.ceil(totalItems / limit);

      const groupChatList = await groupChatModel
        .find({ groupId })
        .populate({
          path: "sender.userName",
          select: "userName",
        })
        .select("sender message")
        .skip(skipCount)
        .limit(limit);

      // Emit the group chat list to the specified room
      io.to(groupId).emit("receive_group_chat_list", groupChatList);

      const paginationData = {
        page,
        totalPages,
        totalItems,
        limit,
      };

      return successResponse({
        res,
        statusCode: 200,
        data: { paginationData, chat: groupChatList },
        message: "Group list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**edit message */
  static edit = async (req, res) => {
    try {
      const { message } = req.body;
      const { groupId, messageId } = req.params;
      const userId = req.user._id;

      // Checking if the user is a member of the specified group
      const isGroupMember = await groupModel.exists({
        _id: groupId,
        users: { $elemMatch: { user: userId } },
      });

      if (!isGroupMember) {
        return res.status(401).json({
          success: false,
          message: "Access denied.",
        });
      }

      // Retrieving information about the specified group
      const existingGroup = await groupModel.findOne({
        _id: groupId,
      });

      if (!existingGroup) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found." });
      }

      // Retrieving the existing message to be edited
      const existingMessage = await groupChatModel.findById(messageId);

      if (!existingMessage) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }

      // Checking if the user is the sender of the message
      if (existingMessage.sender.toString() !== userId.toString()) {
        return res.status(401).json({
          success: false,
          message: "Access denied.",
        });
      }

      // Send notification to all group members
      for (const user of existingGroup.users) {
        if (user.user.toString() !== userId.toString()) {
          const notification = await notificationModel({
            user: user.user,
            group: groupId,
            message: messageId,
          });

          await notification.save();
        }
      }

      // Updating the message content
      const result = await groupChatModel.findByIdAndUpdate(
        messageId,
        { message },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Message updated.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**unsend message */
  static unsent = async (req, res) => {
    try {
      const { groupId, messageId } = req.params;
      const userId = req.user._id;

      // make sure member exist in group
      const isGroupMember = await groupModel.exists({
        _id: groupId,
        users: { $elemMatch: { user: userId } },
      });

      if (!isGroupMember) {
        return res.status(401).json({
          success: false,
          message: "Access denied.",
        });
      }

      // Make sure group exist
      const existingGroup = await groupModel.findOne({
        _id: groupId,
      });

      if (!existingGroup) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found." });
      }

      // Retrieving the existing message to be unsent
      const existingMessage = await groupChatModel.findById(messageId);

      if (!existingMessage) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }

      // Checking if the user is the sender of the message
      if (existingMessage.sender.toString() !== userId.toString()) {
        return res.status(401).json({
          success: false,
          message: "Access denied.",
        });
      }

      // Deleting the message from the group chat
      await groupChatModel.findByIdAndDelete(messageId);

      // Send notification to all group members
      for (const user of existingGroup.users) {
        if (user.user.toString() !== userId.toString()) {
          const notification = await notificationModel({
            user: user.user,
            group: groupId,
            message: messageId,
            action: "unsend",
          });

          await notification.save();
        }
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "Message unsend.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
