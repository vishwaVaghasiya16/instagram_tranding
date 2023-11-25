import nodemailer from "nodemailer";
import { errorResponse } from "../helper/apiResponse.js";

/**send mail */
export const sendMail = async (req, res) => {
  const reqBody = req.body;

  const mailTransporter = nodemailer.createTransport(
    reqBody.email,
    reqBody.text,
    reqBody.subject
  );

  if (!mailTransporter) {
    const errorObj = {
      details: [
        {
          path: "email",
          message: "something wents worng , please try again or later!",
        },
      ],
    };
    return errorResponse({ res, error: errorObj });
  }
};
