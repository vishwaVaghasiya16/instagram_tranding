import express from "express";
import validate from "../post/validate.js";
import controller from "./controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import multer from "multer";

const route = express.Router();

/**create new post */
route.post("/", verifyToken, validate.createPost, controller.createPost);

/**Configure multer */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**get upload url */
route.get("/uploadUrl?fileName", verifyToken, controller.getUploadUrl);

/**write file upload */
route.post(
  "/upload/:fileId",
  upload.single("chunk"),
  validate.upload,
  controller.upload
);

/**get last chunk(for resume upload large file) */
route.get("/upload/:fileId/last-chunk", controller.lastUploadedChunk);

/**read file in chunk */
route.get("/readFile/:fileName", controller.readFile);

/**get all posts */
route.get("/:id?", controller.getAllPost);

/**update post */
route.put("/:id", validate.update, controller.updatePost);

/**delete post */
route.delete("/:id", controller.delete);

export default route;
