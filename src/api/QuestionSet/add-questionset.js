const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    Aid: Joi.string().required(),
    name: Joi.string().required(),
    ListofQuestion: Joi.array().required(),
    menus: Joi.array().required(),
    subMenus: Joi.array().required(),
    description: Joi.string().required(),
    // imagePath: Joi.string().allow("")
  }),

  handler: async (req, res) => {
    const { Aid, name, ListofQuestion, description } = req.body;
    const { user } = req;
    // console.log("tttttttttttttttttttttttttttttttt",user)
    if (user.type !== enums.USER_TYPE.ADMIN) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_AUTHORIZED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    if (!name || !ListofQuestion || !description) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FILL_DETAILS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    if (ListofQuestion.length == 0) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FILL_DETAILS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    try {
      const checkMenu = await global.models.GLOBAL.QUESTIONSET.find({
        Aid: Aid,
        name: name,
      });
      if (checkMenu.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.EXISTS_QUESTIONSET,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }
      let AmenintiesCreate = {
        Aid: Aid,
        name: name,
        // Option : Option,
        ListofQuestion: ListofQuestion,
        description: description,
      };
      const newAmeninties = await global.models.GLOBAL.QUESTIONSET(
        AmenintiesCreate
      );
      newAmeninties.save();
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.QSET_ADDED,
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
