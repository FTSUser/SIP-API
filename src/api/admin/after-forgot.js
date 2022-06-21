const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// User Profile update
module.exports = exports = {
    validation: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    }),
    handler: async (req, res) => {
        // const { user } = req;
        // console.log("USER-->>", user);
        const { email, password } = req.body;
        // console.log("BODY-->>", req.body);
        if (!email || !password) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.FILL_DETAILS,
                payload: {},
                logPayload: false,
            };
            return res
                .status(enums.HTTP_CODES.BAD_REQUEST)
                .json(utils.createResponseObject(data4createResponseObject));
        }
        try {
            let findUser = await global.models.GLOBAL.ADMIN.findOne({
                email: email,
            });
    //   let findUser = await global.models.GLOBAL.ADMIN.findOne({
    //     _id: user._id,
    //   });
      console.log("FINDUSEER--->>", findUser);
      console.log("PASS-->>", password);
      console.log("FIND PASS--->>", findUser.password);
      if (findUser.email == null) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.INVALID_EMAIL,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else{
        console.log("PASS-->>", password);
        await global.models.GLOBAL.ADMIN.findByIdAndUpdate(
            findUser._id,
            {
                $set: { password: password },
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
