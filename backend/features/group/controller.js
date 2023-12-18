import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { handleFile } from "../../helper/buffer.js";
import notificationModel from "../notification/model.js";
import groupModel from "./model.js";

class controller {
  /**create group */
  static create = async (req, res) => {
    try {
      const { users, groupName, photo } = req.body;
      const admin = req.user._id;

      const updatedUsers = Array.from(
        new Set([...users, { user: admin, isAdmin: true }])
      );

      const groupPhoto = await handleFile({
        file: photo,
        folderName: "/group/photo",
      });

      const doc = {
        users: updatedUsers,
        admin,
        groupName,
        photo: groupPhoto,
      };

      const result = await groupModel(doc).save();

      // Save notification for each user
      for (const user of users) {
        const notification = await notificationModel({
          user: user.user,
          group: groupName,
          admin,
        });
        await notification.save();
      }

      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Group created.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**get group list */
  static get = async (req, res) => {
    try {
      const { groupId } = req.params;
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

      // Retrieving the list of group chat messages
      const aggregation = await groupModel
        .find()
        .populate({ path: "users.user", select: "userName" })
        .populate({ path: "admin", select: "userName" });

      return successResponse({
        res,
        statusCode: 200,
        data: aggregation,
        message: "Group list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**update group */
  static update = async (req, res) => {
    try {
      const { groupName, users, admin } = req.body;
      const { groupId } = req.params;

      const group = await groupModel.findById(groupId);
      if (
        !group ||
        !group.users.some(
          (u) => u.user.toString() === req.user._id.toString() && u.isAdmin
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this group.",
        });
      }

      // Update group details
      if (groupName) group.groupName = groupName;

      // Update group users
      if (users) {
        // Only admin can update users
        if (
          group.users.find(
            (u) => u.user.toString() === req.user._id.toString() && u.isAdmin
          )
        ) {
          for (const user of users) {
            if (user.isAdmin) {
              // Make user admin
              group.admin.push(user.user);

              // Add the user to the users array with isAdmin: true
              group.users.push({ user: user.user, isAdmin: true });
            } else {
              // Add user to the group
              group.users.push(user);
            }
          }
        } else {
          return res
            .status(403)
            .json({ success: false, message: "Access denied." });
        }
      }

      // Update group admins
      if (admin) {
        // Only admin can update admins
        if (
          group.users.find(
            (u) => u.user.toString() === req.user._id.toString() && u.isAdmin
          )
        ) {
          for (const userId of admin) {
            // Make user admin
            group.admin.push(userId);

            // Add the user to the users array with isAdmin: true
            group.users.push({ user: userId, isAdmin: true });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to update group admins.",
          });
        }
      }

      // Save the updated group
      const updatedGroup = await group.save();

      const notificationData = {
        admin: group.admin,
        user: group.users.map((u) => u.user),
        group: group.groupName,
      };

      // Create and save notification for each group member
      for (const userId of notificationData.user) {
        const notification = await notificationModel({
          admin: notificationData.admin,
          user: userId,
          group: notificationData.group,
        });

        await notification.save();
      }

      return successResponse({
        res,
        statusCode: 200,
        data: updatedGroup,
        message: "Group updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
