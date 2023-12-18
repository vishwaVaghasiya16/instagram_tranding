import joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorResponse, validateResponse } from "../../helper/apiResponse.js";
import authModel from "./model.js";
import { JWT_SECRET_KEY } from "../../config/env.js";

class validate {
  /**register user */
  static create = async (req, res, next) => {
    const validation = joi
      .object()
      .keys({
        email: joi.string().email().optional(),
        mobileNumber: joi
          .string()
          .regex(/^[0-9]{10}$/)
          .messages({
            "string.pattern.base": `Phone number must have 10 digits.`,
          })
          .optional(),
        userName: joi.string().alphanum().min(3).max(30).required(),
        fullName: joi.string().required(),
        password: joi.string().required(),
        birthday: joi.date(),
        gender: joi.string(),
        bio: joi.string(),
        name: joi.string(),
        website: joi.string(),
        profile: joi.string(),
        isPrivate: joi.boolean().default(true),
        isMentionable: joi.boolean().default(false),
        bussinessAccount: joi.boolean().default(false),
        threadingEnabled: joi.boolean().default(false),
      })
      .or("email", "mobileNumber");

    const { error } = validation.validate(req.body, { abortEarly: false });

    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };

  /**login user */
  static login = async (req, res, next) => {
    const validation = joi
      .object()
      .keys({
        email: joi.string().email().optional(),
        mobileNumber: joi
          .string()
          .regex(/^[0-9]{10}$/)
          .messages({
            "string.pattern.base": `Phone number must have 10 digits.`,
          })
          .optional(),
        userName: joi.string().alphanum().min(3).max(30).optional(),
        password: joi.string().required(),
      })
      .or("email", "mobileNumber", "userName");

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    const { email, mobileNumber, userName, password } = req.body;

    /** Check if a user with the provided userName exists in the database*/
    let user = await authModel.findOne({ userName: userName });

    /**Check if a user with the provided userName exists in the database */
    if (!user && !userName) {
      user = await authModel.findOne({ email: email });
    }

    /**If user not found by userName, check if a user with the provided email exists */
    if (!user && !userName && !email) {
      user = await authModel.findOne({ mobileNumber: mobileNumber });
    }

    /**If user is still not found, return an error indicating user not found */
    if (!user) {
      let errorObj = {
        details: [
          {
            path: "error",
            message:
              "User not found. Please check your credentials and try again.",
          },
        ],
      };
      return validateResponse({ res, error: errorObj });
    }

    /**verify password */
    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
      let errorObj = {
        details: [
          {
            path: "email",
            message: "email or password maybe not valid",
          },
        ],
      };
      return validateResponse({ res, error: errorObj });
    }

    /**If all checks pass, set the found user in the request object and proceed to the next middleware */
    req.user = user;
    next();
  };

  /**change password */
  static changePassword = async (req, res, next) => {
    const validation = joi.object().keys({
      newPassword: joi.string().required().invalid(joi.ref("oldPassword")),
      oldPassword: joi.string().required(),
      confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });

    if (error) {
      return validateResponse({ res, error });
    }

    const comparePassword = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );

    if (!comparePassword) {
      let errorObj = {
        details: [
          {
            path: "password",
            message: "password is not match with current password",
          },
        ],
      };
      return validateResponse({ res, error: errorObj });
    }

    next();
  };

  /**forgot password */
  static forgotPassword = async (req, res, next) => {
    const validation = joi.object().keys({
      email: joi.string().email().lowercase().required(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });

    if (error) {
      return validateResponse({ res, error });
    }

    const user = await authModel.findOne({ email: req.body.email });
    if (!user) {
      const errorObj = {
        details: [{ path: "email", message: "Email does not exist" }],
      };
      return validateResponse({ res, error: errorObj });
    }
    req.user = user;
    next();
  };

  /**reset password */
  static resetPassword = async (req, res, next) => {
    const validation = joi.object().keys({
      newPassword: joi.string().required().label("newPassword"),
      confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    const { userId } = await jwt.verify(req.params.token, JWT_SECRET_KEY);
    if (!userId) {
      const errorObj = {
        details: {
          path: "Token",
          message: "Token is required!",
        },
      };
      return errorResponse({ res, error: errorObj });
    }
    next();
  };

  /**update user */
  static updateUser = async (req, res, next) => {
    const validation = joi.object().keys({
      email: joi.string().email().optional(),
      mobileNumber: joi
        .string()
        .regex(/^[0-9]{10}$/)
        .messages({
          "string.pattern.base": `Phone number must have 10 digits.`,
        })
        .optional(),
      userName: joi.string().alphanum().min(3).max(30).required(),
      fullName: joi.string().required(),
      birthday: joi.date(),
      gender: joi.string(),
      bio: joi.string(),
      name: joi.string(),
      website: joi.string(),
      profile: joi.string(),
      isPrivate: joi.boolean().default(true),
      isMentionable: joi.boolean().default(false),
      bussinessAccount: joi.boolean().default(false),
      threadingEnabled: joi.boolean().default(false),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }
    next();
  };
}

export default validate;
