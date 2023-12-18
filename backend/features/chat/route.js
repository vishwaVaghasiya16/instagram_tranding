import express from "express";
import controller from "../chat/controller.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const route = express.Router();

/**save chate */
route.post("/:id", verifyToken, controller.create);

/**get chat */
route.get("/:id?", verifyToken, controller.get);

/**update message */
route.put("/:id", verifyToken, controller.update);

/**unsend message */
route.delete("/:id", verifyToken, controller.delete);

/**get chat*/
route.get("/:room/room", verifyToken, controller.getChat);

/**delete all chat */
route.delete("/:id", verifyToken, controller.deleteChat);

export default route;
