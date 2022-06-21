const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwtOptions = require("../../auth/jwt-options");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    code: Joi.string().required()
    
    // phone: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    let { code, email } = req.body;

    if (email.length === 0 || code.length === 0) {
      logger.error(messages.FILL_CODE);
      let data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FILL_CODE,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
    email = email.removeSpaces();

    // Find the phone no and code object and then delete it.
    let verificationEntry;
    try {
      verificationEntry = await global.models.GLOBAL.CODE_VERIFICATION.findOne({
        email:email,
      });
    } catch (error) {
      logger.error(
        `/verify-code - Error encountered while verifying phone: ${error.message}\n${error.stack}`
      );
      let data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.ERROR,
        payload: { error: error },
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (!verificationEntry) {
      // SMS verification failed
      logger.error(
        `/verify-code - SMS verification for USER (email: ${email}) failed!`
      );
      let data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.NOT_ACCEPTABLE)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    // Check number of attempts and expiryTime
    const now = moment();
    const expirationDate = moment(verificationEntry.expirationDate); // another date
    if (now.isAfter(expirationDate)) {
      let data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.EXPIRED_VERIFICATION,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    if (verificationEntry.code !== code) {
      verificationEntry.failedAttempts++;
      await verificationEntry.save();
      let data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FAILED_OTP,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.DUPLICATE_VALUE)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    /* SMS verification done */
    logger.info(
      `/verify-code - SMS verification for USER (email: ${email}) successful!`
    );

    // Find the phone no in user data if it exists or not.
    let admin = await global.models.GLOBAL.ADMIN.findOne({
      email: email,
    }).populate({
      path: "role",
      model: "role",
      select: "_id roleName",
    });
    if (admin !== null) {
      // User found - create JWT and return it
      const data4token = {
        id: admin._id,
        date: new Date(),
        environment: process.env.APP_ENVIRONMENT,
        // phone: phone,
        email: admin.email,
        scope: "login",
        roleId: admin.role,
        rolename: admin.role.roleName,
      };
      admin.token = null;
      const payload = {
        admin: admin,
        userExist: true,
        verified: true,
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        token_type: "Bearer",
      };
      let data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.RIGHT_OTP,
        payload: payload,
        logPayload: false,
      };
      // verificationEntry.delete();
      // !delete verification entry [Prodcution]
      return res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } else {
      // Generate token and enter into the registration collection
      const payload = {
        email: email,
        date: new Date(),
        scope: "verification",
      };
      const token = jwt.sign(payload, jwtOptions.secretOrKey);
      const entry = global.models.GLOBAL.CODE_REGISTRATION({
        email: email,
        code: token,
        date: Date.now(),
      });
      logger.info("/verify-code - Saving registration-code in database");
      try {
        await entry.save();
      } catch (error) {
        logger.error(
          `/verify-code - Error encountered while saving registration-code: ${error.message}\n${error.stack}`
        );
        let data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.FAILED_VERIFICATION,
          payload: { error: error },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      let data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.RIGHT_OTP,
        payload: {
          userExist: false,
          verified: true,
          token: token,
        },
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
