const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation

  handler: async (req, res) => {
    try {
      let { aid } = req.query;
      let { mid } = req.body;

      let search = req.query.search
        ? { name: { $regex: req.query.search, $options: "i" } }
        : {};

      const PURCHASEHISTORYDATA =
        await global.models.GLOBAL.PURCHASEHISTORY.find({
          Aid: aid,
          isAprove: true,
        }).sort({ startDate: -1 });
      // console.log("PURCHASEHISTORYDATA",PURCHASEHISTORYDATA[0].menus )
      try {
        search = req.query.aid
          ? { ...search, _id: { $in: PURCHASEHISTORYDATA[0].menus } }
          : search;
      } catch (e) {
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
      if (mid.length > 0) {
        search = req.body.mid ? { ...search, mid: { $all: mid } } : search;
      }
      let Menus = await global.models.GLOBAL.SUBMENU.find(search).sort({
        createdAt: -1,
      });
      if (Menus.length > 0) {
        Menus = Menus.sort((a, b) => {
          if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
          }
          if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
          }
          return 0;
        });
      }
      if (Menus.length == 0) {
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
        payload: { Menu: Menus, count: Menus.length },
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
