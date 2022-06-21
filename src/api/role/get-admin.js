const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Get All Role
module.exports = exports = {
  handler: async (req, res) => {
    const { user } = req;

    // if (roleStatus) {
    try {
      let admin = await global.models.GLOBAL.ROLE.findOne({
        roleName: "admin",
      });
      // console.log(allRole)
      // allRole = JSON.parse(JSON.stringify(allRole));
      // console.log(allRole)

      if (!admin) {
        let data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.GENERAL,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        let data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ROLE_FETCH_SUCCESS,
          payload: { admin },
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
      let data4createResponseObject = {
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
