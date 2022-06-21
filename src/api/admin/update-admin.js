/**
 * Created by Bhargav Butani on 02.09.2021.
 */
const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Users from the database.
module.exports = exports = {
  // router validation
  validation: Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().required(),
    phone: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { fname, lname, phone } = req.body;

    if (
      !(
        user.type == enums.USER_TYPE.ADMIN ||
        user.type == enums.USER_TYPE.SUPERADMIN ||
        user.type == enums.USER_TYPE.USER
      )
    ) {
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

    const { id } = req.params;

    // if(user.type != enums.USER_TYPE.SUPERADMIN){
    //     if(id!=user._id){
    //         const data4createResponseObject = {
    //             req: req,
    //             result: -1,
    //             message: messages.NOT_AUTHORIZED,
    //             payload: {},
    //             logPayload: false
    //         };
    //         return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    //     }
    // }

    try {
      let checkphone = await global.models.GLOBAL.ADMIN.findOne({
        phone: phone,
        _id: { $ne: id },
      });
      if (checkphone) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.METHOD_NOT_ALLOWED,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.UNAUTHORIZED)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      let admin = await global.models.GLOBAL.ADMIN.findByIdAndUpdate(
        { _id: id },
        {
          fname: fname,
          lname: lname,
          phone: phone,
          modificationData: new Date(),
        }
      );
      console.log("admin", admin);
      admin = await global.models.GLOBAL.ADMIN.find(
        { _id: id },
        {
          role: 0,
          password: 0,
        }
      );
      console.log("admin", admin);

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS_UPDATE,
        payload: { admin },
        logPayload: false,
      };
      return res
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
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
