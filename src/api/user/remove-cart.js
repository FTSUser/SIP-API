const enums = require("../../../json/enums.json");
const Joi = require("joi");
const logger = require("../../logger");
const messages = require("../../../json/messages.json");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

module.exports = exports = {
  // route validation
  validation: Joi.object({
    id: Joi.string().required(),
    deviceId: Joi.string().allow()
  }),
  // route handler
  handler: async (req, res) => {
    const { id, deviceId } = req.query;
    let userDetail;
    if (req.headers.authorization) {
      userDetail = await utils.getHeaderFromToken(req.headers.authorization);
    }

    try {
      // remove item from cart
      if (userDetail) {
        await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: userDetail.id, "status.name": "active" },
          { $pull: { cart: { productId: ObjectId(id) } } },
          { new: true }
        ).exec();

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_REMOVED,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        await global.models.GLOBAL.CART.findOneAndUpdate(
          { deviceId: deviceId },
          { $pull: { cart: { productId: ObjectId(id) } } },
          { new: true }
        ).exec();

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_REMOVED,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }
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
