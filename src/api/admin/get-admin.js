/**
 * Created by Bhargav Butani on 02.09.2021.
 */
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");
const jwt = require("jsonwebtoken");
const logger = require("../../logger");
const utils = require("../../utils");
const jwtOptions = require("../../auth/jwt-options");
// Retrieve and return all Users from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
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

    const { id } = req.params;

    // if(user.type != enums.USER_TYPE.SUPERADMIN ){
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
      let admin = await global.models.GLOBAL.ADMIN.findOne(
        { _id: id },
        {
          password: 0,
        }
      ).populate({ path: "role", model: "role" });
      const data4token = {
        id: id,
        date: new Date(),
        environment: process.env.APP_ENVIRONMENT,
        email: admin.email,
        scope: "login",
        type: admin.role.roleName,
      };
      // admin = {
      //   admin,
      //   // ...admin._doc,
      //   token: jwt.sign(data4token, jwtOptions.secretOrKey),
      //   token_type: "Bearer",
      // };

      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: {
          admin,
          token: jwt.sign(data4token, jwtOptions.secretOrKey),
          token_type: "Bearer",
        },
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
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
