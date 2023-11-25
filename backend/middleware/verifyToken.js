import { JWT_SECRET_KEY } from "../config/env.js";
import authModel from "../features/auth/model.js";
import { validateResponse } from "../helper/apiResponse.js";
import jwt from "jsonwebtoken";

let errorObj = {
  details: [
    {
      path: "authentication",
      message: "authentication and bearer token is required",
    },
  ],
};

export const verifyToken = async (req, res, next) => {
  /**pass token in header */
  const token = req.headers.authorization;

  if (!token)
    return validateResponse({ res, error: errorObj, statusCode: 401 });

  /**check bearer token */
  const checkPreferences = token.startsWith("Bearer ");
  if (!checkPreferences)
    return validateResponse({ res, error: errorObj, statusCode: 401 });

  /**verify token */
  const removeToken = token.split(" ")[1];
  const verify = jwt.verify(removeToken, JWT_SECRET_KEY);
  if (!verify)
    return validateResponse({ res, error: errorObj, statusCode: 401 });

  /**get userId */
  const userId = verify.userId;

  const user = await authModel.findById(userId);
  if (!user) return validateResponse({ res, error: errorObj, statusCode: 401 });

  req.user = user;

  next();
};
