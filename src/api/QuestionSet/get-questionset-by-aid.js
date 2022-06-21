const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation

  handler: async (req, res) => {
    try {
      let Aid = req.params.Aid;
      if (!Aid) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.INVALID_PARAMETERS,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }

      // const question = await global.models.GLOBAL.QUESTIONSET.findOne({
      //   Aid: Aid,
      // }).distinct("ListofQuestion");
      // const subMenus = await global.models.GLOBAL.QUESTION.find({
      //   _id: { $in: question },
      // }).distinct("Sid");
      // const Menus = await global.models.GLOBAL.SUBMENU.find({
      //   _id: { $in: subMenus },
      // }).distinct("mid");
      const count = await global.models.GLOBAL.QUESTIONSET.find({
        Aid: Aid,
      }).count();
      const QuestionSet = await global.models.GLOBAL.QUESTIONSET.find({
        Aid: Aid,
      })
        .populate({
          path: "ListofQuestion",
          model: "question",
        })
        .sort({ createdAt: -1 });
      if (!QuestionSet) {
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
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: {
            QuestionSet: QuestionSet,
            // question: question,
            count: count,
          },
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

// const nearProperty=await global.models.GLOBAL.QUESTIONSET.find({_id:{$ne:id}, });
//     const data4createResponseObject = {
//         req: req,
//         result: 0,
//         message: messages.SUCCESS,
//         payload: { Property:Propertys,nearProperty:nearProperty },
//         logPayload: false
//     };
//     res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
// }
