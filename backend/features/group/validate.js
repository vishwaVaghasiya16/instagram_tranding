import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create post */
  static create = async (req, res, next) => {
    const validation = joi.object().keys({
      photo: joi.string().required().label("photo"),
      users: joi.array().items(
        joi.object({
          user: joi.string().required(),
          isAdmin: joi.boolean().default(false),
        })
      ),
      groupName: joi.string(),
      admin: joi.array().required(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };

  /**update post */
  static update = async (req, res, next) => {
    const validation = joi.object().keys({
      groupName: joi.string(),
      photo: joi.string().allow(),
      users: joi.array().items(
        joi.object({
          user: joi.string(),
          isAdmin: joi.boolean().default(false),
        })
      ),
      admin: joi.array(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };
}

export default validate;
