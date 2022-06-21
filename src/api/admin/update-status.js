const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    isActive: Joi.boolean().required(),
  }),
  handler: async (req, res) => {
    const { isActive } = req.body;
    const { user } = req;
    const { id } = req.params;
    // const pid = req.params.pid;
    if (user.type !== enums.USER_TYPE.SUPERADMIN) {
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
    try {
      const admin = await global.models.GLOBAL.ADMIN.findByIdAndUpdate(
        { _id: id },
        { $set: { isActive: isActive } },
        { new: true }
      );
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.ITEM_UPDATED,
        payload: { admin },
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
