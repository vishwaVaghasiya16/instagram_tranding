import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import validate from "../replyComment/validate.js";
import controller from "../replyComment/controller.js";

const route = express.Router();

/**create reply comment */
route.post("/:id", verifyToken, validate.create, controller.create);

/**get all reply comments */
route.get("/:id", verifyToken, controller.get);

/**like reply */
route.post("/like/:id", verifyToken, controller.like);

/**delete reply comment */
route.delete("/:id", verifyToken, controller.delete);

export default route;
