import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "../comments/controller.js";
import validate from "../comments/validate.js";

const route = express.Router();

/**submit comment */
route.post("/:id", verifyToken, validate.create, controller.createComment);

/**get all list of comments by post id */
route.get("/:id?", verifyToken, controller.getAllComments);

/**delete post */
route.delete("/:id", verifyToken, controller.deleteComments);

export default route;
