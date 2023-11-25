import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create report reason list */
  static create = async (req, res, next) => {
    const validation = joi.object().keys({
      reports: joi.array().required(),
      other: joi.string(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };
}

export default validate;
