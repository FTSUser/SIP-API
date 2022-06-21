const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation

  handler: async (req, res) => {
    // console.log("ttttttttttttttttt")
    try {
      const { user } = req;

      if (user.type != enums.USER_TYPE.SUPERADMIN) {
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
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(page) - 1) * limit;

      let search = req.query.search
        ? {
            $and: [
              { name: { $regex: req.query.search, $options: "i" } },
              { subject: { $regex: req.query.search, $options: "i" } },
              { email: { $regex: req.query.search, $options: "i" } },
              { message: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};

      const count = await global.models.GLOBAL.CONTACTUSADMIN.find(
        search
      ).count();
      const Contactus = await global.models.GLOBAL.CONTACTUSADMIN.find(search)
        .sort({ creationDate: -1 })
        .skip(skip)
        .limit(limit);
      if (Contactus.length == 0) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { Contactus: Contactus, count: count },
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
