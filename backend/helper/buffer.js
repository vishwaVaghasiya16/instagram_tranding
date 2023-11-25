import fs from "fs";
import path from "path";
import randomize from "./randomize.js";
import { SERVER_URL } from "../config/env.js";

/**create file */
export const handleFile = async ({ file, folderName }) => {
  const buffer = Buffer.from(file, "base64");
  const fileName = `${Date.now()}${randomize(0, 12)}.jpg`;
  const dirName = path.join(process.cwd(), "public", folderName);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  const filePath = path.join(dirName, fileName);
  fs.writeFileSync(filePath, buffer);
  return `${SERVER_URL}${folderName}/${fileName}`;
};

/**delete file */
export const deleteFile = async ({ folderName, fileName }) => {
  if (!folderName || !fileName) {
    return;
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    folderName,
    fileName.split("/").slice(-1)[0]
  );
  fs.unlinkSync(filePath);
};
