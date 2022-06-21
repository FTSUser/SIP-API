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
      req.query.page = req.query.page ? req.query.page : 1;
      let page = parseInt(req.query.page);
      req.query.limit = req.query.limit ? req.query.limit : 10;
      let limit = parseInt(req.query.limit);
      let skip = (parseInt(req.query.page) - 1) * limit;
      let Aid = req.query.Aid;
      let search = req.query.search
        ? {
            name: { $regex: req.query.search, $options: "i" },
            Aid: Aid,
            isExamDone: true,
          }
        : { Aid: Aid, isExamDone: true };

      const count = await global.models.GLOBAL.RESPONSE.find(search).count();
      const response = await global.models.GLOBAL.RESPONSE.find(search)
        .sort({ createdAt: -1 })
        .populate({
          path: "ListofQuestion",
          model: "question",
        });
      let all = [];
      // console.log("rrrrrrrrrrrrrr", response.ListofQA.length)
      for (k = 0; k < response.length; k++) {
        let total = 0,
          score = 0;
        let loq = [];
        for (i = 0; i < response[k].ListofQA.length; i++) {
          let testans = [];
          for (j = 0; j < response[k].ListofQA[i].Option.length; j++) {
            // console.log("op----", response[k].ListofQA[i].Option[j].istrue)
            if (response[k].ListofQA[i].Option[j].istrue == true) {
              testans.push(response[k].ListofQA[i].Option[j].no);
            }
          }
          console.log("true ans", testans);
          if (
            testans.sort().join(",") ===
            response[k].ListofQA[i].Answer.sort().join(",")
          ) {
            console.log("true vishvans");
            score++;
            loq.push({ ...response[k].ListofQA[i]._doc, isRight: true });
          } else {
            console.log("false vishvans");
            loq.push({ ...response[k].ListofQA[i]._doc, isRight: false });
          }
          total++;
        }
        all.push({ ...response[k]._doc, loq, total, score });
      }

      if (all.length == 0) {
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
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.SUCCESS,
        payload: { all: all, count: count },
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
