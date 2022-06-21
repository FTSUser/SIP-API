const ObjectId = require("mongodb").ObjectId;
const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Delete category with the specified catId in the request

module.exports = exports = {
  // route validation

  // route handler
  handler: async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const { Aid, name, ListofQuestion, menus, subMenus, description } =
      req.body;
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
    if (!id || !name) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.INVALID_PARAMETERS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      let Item = await global.models.GLOBAL.QUESTIONSET.findById(id);

      if (!Item) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const checkQuestion = await global.models.GLOBAL.QUESTIONSET.find({
          Aid: Aid,
          name: name,
          ListofQuestion: ListofQuestion,
        });
        if (checkQuestion.length > 0) {
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
        Item = await global.models.GLOBAL.QUESTIONSET.update(
          { _id: id },
          {
            $set: {
              Aid: Aid,
              name: name,
              ListofQuestion: ListofQuestion,
              menus: menus,
              subMenus: subMenus,
              description: description,
            },
          }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.QSET_UPDATED,
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
