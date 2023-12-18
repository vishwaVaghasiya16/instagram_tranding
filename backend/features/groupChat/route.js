import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "../groupChat/controller.js";

const route = express.Router();

/**create groupChat */
route.post("/:groupId/message", verifyToken, controller.create);

/**group list */
route.get("/:groupId/chat", verifyToken, controller.list);

/**edit message */
route.put("/:groupId/message/:messageId", verifyToken, controller.edit);

/**unsent message */
route.delete("/:groupId/unsent/:messageId", verifyToken, controller.unsent);

export default route;
