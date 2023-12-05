import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create reply comment */
  static create = async (req, res, next) => {
    const validation = joi.object().keys({
      reply: joi.string(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }
    next();
  };
}

export default validate;
