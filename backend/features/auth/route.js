import { verifyToken } from "../../middleware/verifyToken.js";
import controller from "./controller.js";
import validate from "./validate.js";
import express from "express";

const route = express.Router();

route.post("/register", validate.create, controller.register);
route.post("/login", validate.login, controller.login);

/**change password */
route.patch(
  "/changePassword",
  verifyToken,
  validate.changePassword,
  controller.changePassword
);

/**forgot password */
route.post(
  "/forgotPassword",
  validate.forgotPassword,
  controller.forgotPassword
);

/**reset password */
route.post(
  "/resetPassword/:token",
  validate.resetPassword,
  controller.resetPassword
);

/**get all users */
route.get("/:id?", controller.getAllUsers);

/**update user */
route.put("/:id", validate.updateUser, controller.updateUser);

/**delete user */
route.delete("/:id", controller.deleteUser);

/**follow user */
route.put("/:id/follow", verifyToken, controller.follow);

/**unfollow user */
route.put("/:id/unfollow", verifyToken, controller.unfollow);

export default route;
