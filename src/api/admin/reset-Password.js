const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// User Profile update
module.exports = exports = {
  validation: Joi.object({
    password: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
  handler: async (req, res) => {
    // console.log("gggggggggggggggggggiiiiiiiiiiiiiii");
    const { user } = req;
    console.log("USER-->>", user);
    const { password, newPassword } = req.body;
    // console.log("BODY-->>", req.body);
    if (!password || !newPassword) {
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
      let findUser = await global.models.GLOBAL.ADMIN.findOne({
        email: user.email,
      });
      // let findUser = await global.models.GLOBAL.USER.findOne({
      //   _id: user._id,
      // });
      // // console.log("FINDUSEER--->>", findUser);
      // console.log("PASS-->>", password);
      // console.log("FIND PASS--->>", findUser.password);
      if (findUser.password !== password) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.INVALID_PASSWORD,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        console.log("PASS-->>", newPassword);
        await global.models.GLOBAL.ADMIN.findByIdAndUpdate(
          user._id,
          {
            $set: { password: newPassword },
          },
          { new: true }
        );
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.PASSWORD_UPDATED,
          payload: {},
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
        message: error,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
