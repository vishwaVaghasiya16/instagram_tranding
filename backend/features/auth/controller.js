import authModel from "./model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { successResponse, errorResponse } from "../../helper/apiResponse.js";
import { JWT_SECRET_KEY, SERVER_URL } from "../../config/env.js";
import { sendMail } from "../../middleware/email.js";

class controller {
  /**register user */
  static register = async (req, res) => {
    try {
      const { email, password, mobileNumber, userName, fullName } = req.body;

      const hashPassword = await bcrypt.hash(password, 10);

      const doc = {
        email,
        mobileNumber: mobileNumber,
        userName: userName,
        password: hashPassword,
        fullName: fullName,
      };

      const result = await authModel(doc).save();

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
      const result = await authModel.find(filter);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "feedback list retrived successfully.",
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
}

export default controller;
