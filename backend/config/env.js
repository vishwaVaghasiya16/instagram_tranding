import dotenv from "dotenv";

dotenv.config();

export const {
  PORT,
  MONGODB_URL,
  JWT_SECRET_KEY,
  SERVER_URL,
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD,
  BASE_URL,
  SOCKET_TIMEOUT,
} = process.env;
