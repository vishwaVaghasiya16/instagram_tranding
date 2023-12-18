import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import chatModel from "./model.js";
import { io } from "../../index.js";
import notificationModel from "../notification/model.js";

class controller {
  /**chat create */
  static create = async (req, res) => {
    try {
      const sender = req.user._id;
      const { id } = req.params;
      const { message } = req.body;

      const result = await chatModel.create({
        sender,
        reciever: id,
        message,
      });

      io.to(id).emit("send_message", {
        sender,
        recieve: id,
        message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      });

      // for notification
      const notification = await notificationModel({
        user: sender,
        reciever: id,
        type: "MESSAGE",
        message: message,
      });

      await notification.save();

      return successResponse({
        res,
        statusCode: 201,
        data: { result },
        message: "Chat created.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get chat */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      const { chat } = req.query;
      const userId = req.user._id;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = 10;
      let filter = {};

      if (id) {
        filter.reciever = id;
      }
      if (chat) filter.chat = { $regex: chat, $option: "i" };

      if (userId) {
        filter.$or = [{ sender: userId }, { reciever: userId }];
      }

      const skipCount = (page - 1) * limit;
      const totalItems = await chatModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limit);

      const aggregate = await chatModel
        .find(filter)
        .populate({
          path: "sender",
          select: "userName",
        })
        .populate({
          path: "reciever",
          select: "userName",
        })
        .skip(skipCount)
        .limit(limit);

      const paginationData = {
        page,
        totalPages,
        totalItems,
        limit,
      };

      return successResponse({
        res,
        data: { paginationData, chat: aggregate },
        statusCode: 200,
        message: "Chat list.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**Edit chat */
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const message = req.body;

      const existingMessage = await chatModel.findById({
        _id: id,
        sender: userId,
      });

      if (!existingMessage) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }

      // ONLY SENDER CAN UPDATE THIS MESSAGE
      if (existingMessage.sender.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to edit this message.",
        });
      }

      const result = await chatModel.findByIdAndUpdate(
        id,
        { $set: message },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: { result },
        message: "Message updated.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**Unsend message */
  static delete = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const existingMessage = await chatModel.findById(id);
      if (!existingMessage) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }

      // Check if the user deleting the message is the sender
      if (existingMessage.sender.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this message.",
        });
      }

      await chatModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Message deleted.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get chat */
  static getChat = async (req, res) => {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = 10;

      const skipCount = (page - 1) * limit;
      const totalItems = await chatModel.countDocuments({ room: id });

      const totalPages = Math.ceil(totalItems / limit);

      const result = await chatModel
        .find({ room: id })
        .populate({
          path: "sender",
          select: "userName",
        })
        .populate({
          path: "reciever",
          select: "userName",
        })
        .skip(skipCount)
        .limit(limit)
        .lean();

      const paginationData = {
        page,
        totalPages,
        totalItems,
        limit,
      };

      return successResponse({
        res,
        statusCode: 200,
        data: { paginationData, chat: result },
        message: "Chat list.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete chat */
  static deleteChat = async (req, res) => {
    try {
      const { id } = req.params;

      await chatModel.deleteMany({ room: id });
      return successResponse({
        res,
        statusCode: 200,
        message: "Chat deleted.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
