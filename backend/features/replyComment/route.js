import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import validate from "../replyComment/validate.js";
import controller from "../replyComment/controller.js";

const route = express.Router();

/**create reply comment */
route.post("/:id", verifyToken, validate.create, controller.create);

/**get all reply comments */
route.get("/:id", verifyToken, controller.get);

/**delete reply comment */
route.delete("/:id", verifyToken, controller.delete);

/**like reply */
route.put("/:id/likereply", verifyToken, controller.like);

/**unlike reply */
route.put("/:id/unlikereply", verifyToken, controller.unlike);

export default route;
