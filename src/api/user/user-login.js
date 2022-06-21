const Joi = require("joi");
const jwt = require("jsonwebtoken");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const jwtOptions = require("../../auth/jwt-options");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // route validation
  validation: Joi.object({
    countryCode: Joi.string().trim().allow(""),
    latitude: Joi.string().trim().allow(""),
    longitude: Joi.string().trim().allow(""),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    salt: Joi.string().trim().allow(""),
  }),

  // route handler
  handler: async (req, res) => {
    const domain = "IN";
    const {
      countryCode = "IN",
      latitude,
      longitude,
      password,
      phone,
      salt,
    } = req.body;

    if (!phone || !password) {
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
      // const criteria = {
      //     "phone": phone,
      //     "password": password,
      //     "status.name": { $ne: enums.USER_STATUS.DISABLED.name }
      // };

      // Do we need to check for repeated login attempts?

      const user = await global.models[domain].USER.findOne({ phone: phone });
      if (!user) {
        logger.error(
          `/login - No USER (phone: ${phone}) found with the provided password!`
        );
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.USER_DOES_NOT_EXIST,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.NOT_FOUND)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        if (user.password !== password) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.USER_NOT_FOUND,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_FOUND)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      }

      // User found - create JWT and return it
      const data4token = {
        countryCode: "IN",
        date: new Date(),
        domain: domain,
        environment: process.env.APP_ENVIRONMENT,
        phone: phone,
        scope: "login",
        type: enums.USER_TYPE.USER,
      };

      const payload = {
        country: countryCode, // TODO to be removed once app has also changed to countryCode
        countryCode: countryCode,
        currency: "INR",
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        token_type: "Bearer",
      };

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: "Log in successful!",
        payload: payload,
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
