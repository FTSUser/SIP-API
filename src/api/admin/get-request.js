// const { isAprove } = require(".");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Users from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { isAprove } = req.query;
    const { user } = req;
    // if(!(user.type == enums.USER_TYPE.ADMIN || user.type == enums.USER_TYPE.SUPERADMIN)){
    //     const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: messages.NOT_AUTHORIZED,
    //         payload: {},
    //         logPayload: false
    //     };
    //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    // }

    // const { id } = req.params;

    // if (user.type != enums.USER_TYPE.SUPERADMIN) {
    //         const data4createResponseObject = {
    //             req: req,
    //             result: -1,
    //             message: messages.NOT_AUTHORIZED,
    //             payload: {},
    //             logPayload: false
    //         };
    //         return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));

    // }
    try {
      let admin = await global.models.GLOBAL.PURCHASEHISTORY.find({
        isAprove: isAprove,
      })
        .sort({ startDate: -1 })
        .populate({
          path: "menus",
          model: "submenu",
          populate: { path: "mid", model: "menu" },
        });
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
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
