import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create comment */
  static create = async (req, res, next) => {
    const validation = joi.object().keys({
      comment: joi.string(),
      like: joi.array(),
      reply: joi.array(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };
}

export default validate;
