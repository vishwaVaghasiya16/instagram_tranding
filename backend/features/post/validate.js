import joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  /**create post */
  static createPost = async (req, res, next) => {
    const validation = joi.object().keys({
      url: joi.string().required().label("url"),
      description: joi.string().required(),
      caption: joi.string().required(),
      userId: joi.string(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };

  /**video upload */
  static upload = async (req, res, next) => {
    const validation = joi.object().keys({
      fileName: joi.string().required(),
      totalChunks: joi.string().required(),
      currentChunk: joi.string().required(),
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
      caption: joi.string(),
      url: joi.string().allow(),
      description: joi.string(),
    });

    const { error } = validation.validate(req.body, { abortEarly: false });
    if (error) {
      return validateResponse({ res, error });
    }

    next();
  };
}

export default validate;
