import express from "express";
import controller from "../commentLike-dislike/controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const route = express.Router();

/**like comments */
route.post("/send_like/:id", verifyToken, controller.like);

/**unlike comments */
route.post("/send_unlike/:id", verifyToken, controller.unlike);

/**get all like counts */
route.get("/count/:id", controller.getLikeCount);

export default route;
