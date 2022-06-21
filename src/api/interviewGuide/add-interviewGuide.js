const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    icid: Joi.string(),
    image: Joi.string(),
    guide: Joi.array(),
  }),

  handler: async (req, res) => {
    const { icid, guide, image } = req.body;
    const { user } = req;
    // if (user.type !== enums.USER_TYPE.SUPERADMIN) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.NOT_AUTHORIZED,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.UNAUTHORIZED)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }
    // if (!name) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.FILL_DETAILS,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.BAD_REQUEST)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    try {
      let AmenintiesCreate = {
        icid: icid,
        guide: guide,
        image: image,
      };
      const newAmeninties = await global.models.GLOBAL.INTERVIEWGUIDE(
        AmenintiesCreate
      );
      newAmeninties.save();
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.INTERVIEW_GUIDE_ADDED,
        payload: { newAmeninties },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
