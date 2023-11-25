import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create reports */
  static create = async (req, res, next) => {
    const validation = joi.object().keys({
      title: joi.string().required(),
      commentId: joi.string().required(),
      count: joi.number().integer(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }
    next();
  };
}

export default validate;
