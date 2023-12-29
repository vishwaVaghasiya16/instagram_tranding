import express from "express";
import validate from "./validate.js";
import controller from "./controller.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import multer from "multer";

const route = express.Router();

/**create new post */
route.post("/",verifyToken,validate.createPost,controller.createPost);

/**Configure multer */
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**get upload url */
route.get("/uploadUrl",verifyToken,controller.getUploadUrl);

/**write file upload */
route.post(
  "/upload/:fileId",
  upload.single("chunk"),
  validate.upload,
  controller.upload
);

/**get last chunk(for resume upload large file) */
route.get("/uploadLastChunk/:fileId/last-chunk",controller.resumeUpload);

/**read file in chunk */
route.get("/readFile/:fileName",controller.readFile);

/**get all posts */
route.get("/:id?",verifyToken,controller.getAllPost);

/**update post */
route.put("/:id",validate.update,controller.updatePost);

/**delete post */
route.delete("/:id",controller.delete);

/**like post */
route.put("/:id/likepost",verifyToken,controller.like);

/**unlike post */
route.put("/:id/unlikepost",verifyToken,controller.unlike);

/**get timeline post */
route.get("/timeline/all",verifyToken,controller.timeline);

export default route;
