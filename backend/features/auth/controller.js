import authModel from "./model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "../../helper/apiResponse.js";
import { JWT_SECRET_KEY, SERVER_URL } from "../../config/env.js";
import { sendMail } from "../../middleware/email.js";
import { io } from "../../index.js";
import notificationModel from "../notification/model.js";

class controller {
  /**user status online */
  static userOnline = async (userId) => {
    try {
      await authModel.findByIdAndUpdate(userId, { $set: { status: "online" } });
    } catch (error) {
      console.error("Error updating user status user status online : ", error);
    }
  };

  /**user status offline */
  static userOffline = async (userId) => {
    try {
      await authModel.findByIdAndUpdate(userId, {
        $set: { status: "offline" },
      });
    } catch (error) {
      console.error("Error updating user status offline :", error);
    }
  };

  /**register user */
  static register = async (req, res) => {
    try {
      const {
        userName,
        fullName,
        password,
        birthday,
        gender,
        bio,
        name,
        website,
        profile,
        isPrivate,
        isMentionable,
        bussinessAccount,
        threadingEnabled,
      } = req.body;

      const hashPassword = await bcrypt.hash(password, 10);

      const doc = {
        userName,
        fullName,
        password: hashPassword,
        birthday,
        gender,
        bio,
        name,
        website,
        profile,
        isPrivate,
        isMentionable,
        bussinessAccount,
        threadingEnabled,
      };

      const result = await authModel(doc).save();

      // set user status to online after registration
      await controller.userOnline(result._id);

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "User created successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**login user */
  static login = async (req, res) => {
    try {
      // Create a JWT token with user data
      const token = jwt.sign(
        {
          userId: req.user._id,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "10d",
        }
      );

      // Remove sensitive user data like password before sending the response
      const { password, ...userWithoutPassword } = req.user.toObject();

      // Create a response object
      const response = {
        user: userWithoutPassword,
        token,
      };

      // set user status to online after login
      await controller.userOnline(req.user._id);

      // Send a success response with status code 200
      return res.status(200).json({
        success: true,
        data: response,
        message:
          "Authentication Successful: You have been granted access to your account.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**change password */
  static changePassword = async (req, res) => {
    try {
      const hashPassword = await bcrypt.hash(req.body.newPassword, 10);

      const data = await authModel.findByIdAndUpdate(req.user._id, {
        $set: { password: hashPassword },
      });

      return successResponse({
        res,
        statusCode: 200,
        data: data,
        message: "Password changed successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**forgot password */
  static forgotPassword = async (req, res) => {
    try {
      /**generate token */
      const token = await jwt.sign({ userId: req.user._id }, JWT_SECRET_KEY, {
        expiresIn: "10d",
      });

      /**reset password url */
      const url = `${SERVER_URL}/api/auth/resetPassword/${token}`;

      /**send mail */
      sendMail(req.body.email, "reset password", url);

      return successResponse({
        res,
        statusCode: 200,
        data: url,
        message: "your password is forgeted successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**reset password */
  static resetPassword = async (req, res) => {
    try {
      const { userId } = jwt.verify(req.params.token, JWT_SECRET_KEY);
      const hashPassword = await bcrypt.hash(req.body.newPassword, 10);

      await authModel.findByIdAndUpdate(userId, {
        $set: { password: hashPassword },
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Your password is reset!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get all users */
  static getAllUsers = async (req, res) => {
    const { id } = req.params;
    const { userName } = req.query;
    try {
      // Method 1 - for standerd use while need to add multipal conditions
      // let result;
      // let filter = {};
      // if (userName) filter.userName = { $regex: userName, $options: "i" };
      // if (id) {
      //   result = await authModel.findOne(id);
      // } else {
      //   result = await authModel.find(filter);
      // }

      // Method 2 - for small querys
      let filter = {};
      if (id) filter._id = id;
      if (userName) filter.userName = { $regex: userName, $options: "i" };

      if (filter._id) {
        const user = await authModel.findById(filter._id);
        if (user.isPrivate === "private") {
          // If the account is private, only the user can view their own data
          if (req.user._id.toString() !== filter._id.toString()) {
            return successResponse({
              res,
              statusCode: 403,
              message: "This user's account is private.",
            });
          }
        }
      }

      const result = await authModel.find(filter);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User list retrived successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**update user */
  static updateUser = async (req, res) => {
    try {
      const update = await authModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: update,
        message: "User list retrieved successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**delete user */
  static deleteUser = async (req, res) => {
    try {
      await authModel.findByIdAndDelete(req.params.id);

      return successResponse({
        res,
        statusCode: 200,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**follow or accept friend request */
  static follow = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    try {
      const requestedUser = await authModel.findById(id);
      const currentUser = await authModel.findById(userId);

      // Check if the requested user exists
      if (!requestedUser) {
        return errorResponse({
          res,
          error: "Requested user not found.",
          statusCode: 404,
        });
      }

      // Check if the requested user is private
      if (requestedUser.isPrivate) {
        if (requestedUser.request.includes(userId)) {
          // If the current user has a pending request, accept the friend request
          await requestedUser.updateOne({
            $pull: { request: userId },
            $push: { followers: userId },
          });
          await currentUser.updateOne({
            $push: { following: id },
          });

          // Emit socket event to notify the requested user about the friend request acceptance
          io.to(requestedUser.socketId).emit("friend_request_accepted", {
            senderId: userId,
          });

          // for notification
          const notification = await notificationModel({
            user: userId,
            type: "FOLLOW",
            request: req.params.id,
          });

          await notification.save();

          return successResponse({
            res,
            statusCode: 200,
            message: "Friend request accepted successfully.",
          });
        } else {
          await requestedUser.updateOne({ $push: { request: userId } });

          // Emit socket event to notify the requested user about the friend request
          io.to(requestedUser.socketId).emit("friend_request", {
            senderId: userId,
          });

          // for notification
          const notification = await notificationModel({
            user: userId,
            type: "FRIEND_REQUEST",
            request: req.params.id,
          });

          await notification.save();

          return successResponse({
            res,
            statusCode: 200,
            message: "Friend request sent successfully.",
          });
        }
      } else {
        // If the requested user is public, check if the current user is already following
        if (!requestedUser.followers.includes(userId) && userId !== id) {
          await requestedUser.updateOne({ $push: { followers: userId } });
          await currentUser.updateOne({
            $push: { following: id },
          });

          // Emit socket event notify the requested user about the follow
          io.to(requestedUser.socketId).emit("follow", {
            followerId: userId,
          });

          return successResponse({
            res,
            statusCode: 200,
            message: "User has been followed.",
          });
        } else {
          return successResponse({
            res,
            statusCode: 403,
            message: "You already follow this user.",
          });
        }
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  /** Send friend request to private and public accounts */
  static sendFriendRequest = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    try {
      const [senderUser, receiverUser] = await Promise.all([
        authModel.findById(userId),
        authModel.findById(id),
      ]);

      if (!senderUser || !receiverUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      // Both account are private
      if (receiverUser.isPrivate && senderUser.isPrivate) {
        if (!receiverUser.request.includes(userId)) {
          await receiverUser.updateOne({ $push: { request: userId } });

          // Emit friend request notification to the receiver user
          io.to(receiverUser.socketId).emit("friend_request", {
            senderId: userId,
            receiverId: id,
          });

          // for notification
          const notification = await notificationModel({
            senderId: userId,
            type: "FRIEND_REQUEST",
            receiverId: id,
          });

          await notification.save();

          return successResponse({
            res,
            statusCode: 200,
            message: "Request send.",
          });
        } else {
          return res.status(403).json({
            success: false,
            message: "Access denied.",
          });
        }
      }

      // private account is try to send request to public account
      if (!receiverUser.request.includes(userId)) {
        if (!receiverUser.isPrivate && senderUser.isPrivate) {
          await receiverUser.updateOne({ $push: { followers: userId } });
          await senderUser.updateOne({ $push: { following: id } });

          // Emit friend request notification to the receiver user
          io.to(receiverUser.socketId).emit("friend_request", {
            senderId: userId,
            receiverId: id,
          });

          // for notification
          const notification = await notificationModel({
            senderId: userId,
            type: "FRIEND_REQUEST",
            receiverId: id,
          });

          await notification.save();

          return successResponse({
            res,
            statusCode: 200,
            message: "Request send.",
          });
          // public account is try to send request to private account
        } else if (receiverUser.isPrivate && !senderUser.isPrivate) {
          await receiverUser.updateOne({ $push: { request: userId } });

          // Emit friend request notification to the receiver user
          io.to(receiverUser.socketId).emit("friend_request", {
            senderId: userId,
            receiverId: id,
          });

          // for notification
          const notification = await notificationModel({
            senderId: userId,
            type: "FRIEND_REQUEST",
            receiverId: id,
          });

          await notification.save();

          return successResponse({
            res,
            statusCode: 200,
            message: "Request send.",
          });
        }
      }

      // Both account are public
      if (!receiverUser.request.includes(userId)) {
        if (!senderUser.isPrivate && !receiverUser.isPrivate) {
          // Check if both accounts are public
          await receiverUser.updateOne({ $push: { followers: userId } });
          await senderUser.updateOne({ $push: { following: id } });

          // Emit friend request notification to the receiver user
          io.to(receiverUser.socketId).emit("friend_request", {
            senderId: userId,
            receiverId: id,
          });

          // for notification
          const notification = await notificationModel({
            senderId: userId,
            type: "FRIEND_REQUEST",
            receiverId: id,
          });

          await notification.save();

          return res
            .status(200)
            .json({ success: true, message: "Friend request sent." });
        } else {
          return res.status(403).json({
            success: false,
            message: "Access denied.",
          });
        }
      } else {
        return res
          .status(403)
          .json({ success: false, message: "Friend request already sent." });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  /**reject request */
  static rejectFriendRequest = async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const user = await authModel.findById(id);
      const currentUser = await authModel.findById(userId);

      if (user.request.includes(userId)) {
        await user.updateOne({ $pull: { request: userId } });
        await currentUser.updateOne({ $pull: { request: id } });

        return successResponse({
          res,
          statusCode: 200,
          message: "Friend request rejected.",
        });
      } else {
        return successResponse({
          res,
          statusCode: 200,
          message: "No request found from this user.",
        });
      }
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**unfollow user */
  static unfollow = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    if (userId !== id) {
      try {
        const user = await authModel.findById(id);
        const currentUser = await authModel.findById(userId);
        if (user.followers.includes(userId)) {
          await user.updateOne({ $pull: { followers: userId } });
          await currentUser.updateOne({ $pull: { following: id } });
          return successResponse({
            res,
            statusCode: 200,
            message: "User has been unfollowed.",
          });
        } else {
          return successResponse({
            res,
            statusCode: 403,
            message: "You don't follow this user.",
          });
        }
      } catch (error) {
        return errorResponse({ res, error });
      }
    }
  };

  /**get user details */
  static getUserDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await authModel.findById(id);

      if (!user) {
        return errorResponse({
          res,
          error: "User not found.",
          statusCode: 404,
        });
      }

      const curentUser = await authModel.findById(req.user._id);

      if (!user.isPrivate) {
        // If the account is public, show details
        const publicUserDetails = {
          _id: user._id,
          userName: user.userName,
          followers: user.followers,
          following: user.following,
        };

        return successResponse({
          res,
          statusCode: 200,
          data: publicUserDetails,
          message: "User details get successfully.",
        });
      }

      if (user.isPrivate && curentUser.following.includes(id)) {
        const pipeline = [
          {
            $match: { _id: user._id },
          },
          {
            $project: {
              _id: 1,
              userName: 1,
              followers: 1,
              following: 1,
            },
          },
        ];

        const userDetails = await authModel.aggregate(pipeline);

        return successResponse({
          res,
          statusCode: 200,
          data: userDetails[0],
          message: "User details.",
        });
      }

      return successResponse({
        res,
        statusCode: 403,
        message: "Follow to see their photos and videos.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**disconnect user */
  static disconnect = async (userId) => {
    try {
      await controller.userOffline(userId);
    } catch (error) {
      console.error("Error updating user status after disconnection.");
    }
  };
}

export default controller;
