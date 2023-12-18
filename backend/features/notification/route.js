import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "../notification/controller.js";

const route = express.Router();

/**get all notifications */
route.get("/", verifyToken, controller.get);

/**Mark notification as read */
route.put("/:id/read", verifyToken, controller.read);

/**Mark all notification as read for a user */
route.put("/all_read", verifyToken, controller.readNotification);

export default route;
