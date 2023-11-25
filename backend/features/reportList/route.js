import express from "express";
import controller from "../reportList/controller.js";
import validate from "../reportList/validate.js";
import { verifyToken } from "../../middleware/verifyToken.js";

const route = express.Router();

/**create report reason */
route.post("/", verifyToken, validate.create, controller.create);

/**get report reason */
route.get("/:id?", controller.get);

/**update report reson */
route.put("/:id", verifyToken, controller.update);

/**delete report reason */
route.delete("/:id", verifyToken, controller.delete);

export default route;
