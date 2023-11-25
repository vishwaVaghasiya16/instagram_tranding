import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import validate from "../../features/report/validate.js";
import controller from "../../features/report/controller.js";

const route = express.Router();

/**create report */
route.post("/", verifyToken, validate.create, controller.create);

/**get reports */
route.get("/:id?", controller.get);

/**update reports */
route.put("/:id", verifyToken, controller.update);

/**delete reports */
route.delete("/:id", verifyToken, controller.delete);

export default route;
