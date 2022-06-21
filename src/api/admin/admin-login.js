const Joi = require("joi");
const jwt = require("jsonwebtoken");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const jwtOptions = require("../../auth/jwt-options");
const logger = require("../../logger");
const utils = require("../../utils");

module.exports = exports = {
  // router validation
  validation: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // route handler
  handler: async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      logger.error(messages.FIELD_REQUIRE);
      const data4createResponseObject = {
        req: req,
        result: -400,
        message: messages.FIELD_REQUIRE,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
      return;
    }

    try {
      // const criteria = {
      //     "phone": phone,
      //     "password": password,
      //     "status.name": { $ne: enums.USER_STATUS.DISABLED.name }
      // };

      const aadmin = await global.models.GLOBAL.ADMIN.find({});
      console.log(aadmin);
      const admin = await global.models.GLOBAL.ADMIN.findOne({
        email: email,
      }).populate({
        path: "role",
        model: "role",
        select: "_id roleName",
      });
      console.log("admin", admin.isActive);
      if (!admin) {
        logger.error(
          `/login - No ADMIN (email: ${email}) found with the provided password!`
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
        if (admin.isActive == false) {
          const data4createResponseObject = {
            req: req,
            result: -1,
            message: messages.USER_DEACTIVE,
            payload: {},
            logPayload: false,
          };
          return res
            .status(enums.HTTP_CODES.NOT_FOUND)
            .json(utils.createResponseObject(data4createResponseObject));
        }
        if (admin.password !== password) {
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

      const rolename = await global.models.GLOBAL.ROLE.findOne({
        _id: admin.role,
      });
      if (rolename.roleName === "admin") {
        role = enums.USER_TYPE.ADMIN;
      } else if (rolename.roleName === "superadmin") {
        role = enums.USER_TYPE.SUPERADMIN;
      } else if (rolename.roleName === "user") {
        role = enums.USER_TYPE.USER;
      }
      console.log("roleName", rolename);
      // User found - create JWT and return it
      const data4token = {
        id: admin._id,
        date: new Date(),
        environment: process.env.APP_ENVIRONMENT,
        email: email,
        scope: "login",
        type: role,
      };
      delete admin._doc.password;
      const payload = {
        admin: admin,
        token: jwt.sign(data4token, jwtOptions.secretOrKey),
        token_type: "Bearer",
      };

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.LOGIN_SUCCESS,
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
