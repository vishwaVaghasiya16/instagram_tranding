import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "../group/controller.js";

const route = express.Router();

/**create group */
route.post("/", verifyToken, controller.create);

/**get group list */
route.get("/:groupId", verifyToken, controller.get);

/**update group */
route.put("/:groupId", verifyToken, controller.update);

export default route;
