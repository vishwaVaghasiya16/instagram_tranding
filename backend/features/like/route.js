import express from "express";
import controller from "../like/controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const route = express.Router();

/**like post */
route.post("/send_like/:id", verifyToken, controller.like);

/**unlike post */
route.post("/send_unlike/:id", verifyToken, controller.unlike);

/**get all like counts */
route.get("/count/:id", controller.getLikeCount);

export default route;
