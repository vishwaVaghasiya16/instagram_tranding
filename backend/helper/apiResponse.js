import mongoose from "mongoose";

/**success response */
export const successResponse = ({
  res,
  statusCode,
  data,
  message,
  success = true,
}) => {
  return res.status(statusCode).json({ message, success, data });
};

/**error response */
export const errorResponse = async ({
  funName,
  res,
  error,
  success = false,
  statusCode = 500,
  message = "Internal server error",
}) => {
  // console.log(`[ERROR] ${funName} : ${error.message}`);
  message = error.message;
  if (error instanceof mongoose.Error.CastError) {
    message = "Invalid ID provided";
  } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
    message = "Document not found";
  } else if (error instanceof mongoose.Error.ValidationError) {
    message = "Validation failed";
    statusCode = 401;
  }
  if (error.name === "MongoServerError" && error.code === 11000) {
    message = "Document already exists";
  } else if (error.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  } else if (error.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  } else if (error.name === "NotBeforeError") {
    message = "Token not yet valid";
    statusCode = 401;
  }
  return res.status(statusCode).json({ success, message });
};

/**validate response */
export const validateResponse = ({ res, error, statusCode = 400 }) => {
  let arrOjb = { message: "error", success: false };

  error.details.map((item, key) => {
    const { path, message } = item;
    arrOjb = { ...arrOjb, [path]: message.replace(/['"]/g, "") };
  });

  return res.status(statusCode).json(arrOjb);
};
