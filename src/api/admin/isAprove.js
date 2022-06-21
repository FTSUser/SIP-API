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
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { id } = req.params;
    let isAprove = req.query.isAprove;
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

    try {
      let checkphone = await global.models.GLOBAL.PURCHASEHISTORY.findById({
        _id: id,
      });
      if (!checkphone) {
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
        { _id: checkphone.Aid },
        { isMenuVisible: true }
      );
      console.log("admin", admin);
      // let findPaymentIntent = await global.models.GLOBAL.PAYMENT.find({"PaymentId.clientSecret":})
      let updateStatus =
        await global.models.GLOBAL.PURCHASEHISTORY.findByIdAndUpdate(
          { _id: id },
          { isAprove: isAprove, isRequested: false }
        );
      //  console.log(new Date())
      updateStatus = await global.models.GLOBAL.PURCHASEHISTORY.find(
        { _id: id },
        {
          role: 0,
          password: 0,
        }
      );

      if (isAprove == "true") {
        const notification = await global.models.GLOBAL.NOTIFICATION.create({
          type: "Request for submenu is approved",
          sender: user._id,
          receiver: admin._id,
        });
        console.log("if");
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.MENU_APPROVED,
          payload: { admin, updateStatus },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const notification = await global.models.GLOBAL.NOTIFICATION.create({
          type: "Request for submenu is rejected",
          sender: user._id,
          receiver: admin._id,
        });
        console.log("else");
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.MENU_REJECTED,
          payload: { admin, updateStatus },
          logPayload: false,
        };
        return res
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
