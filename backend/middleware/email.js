import nodemailer from "nodemailer";
import {
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USERNAME,
} from "../config/env.js";

/**create transporter */
const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

/**send mail */
export const sendMail = (to, subject, text) => {
  transport.sendMail({
    to,
    from: EMAIL_FROM,
    subject,
    text,
  });
};
