import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "../../features/replyLikeComment/controller.js";

const route = express.Router();

/**like reply comments */
route.post("/send_like/:id", verifyToken, controller.like);

/**unlike reply comments */
route.post("/send_unlike/:id", verifyToken, controller.unlike);

/**get all like counts */
route.get("/count/:id", controller.getLikeCount);
export default route;
