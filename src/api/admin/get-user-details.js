/**
 * Created by Bhargav Butani on 02.09.2021.
 */
const { ObjectId } = require("mongodb");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return all Users from the database.
module.exports = exports = {
  // route handler
  handler: async (req, res) => {
    const { user } = req;
    // if (!(user.type == enums.USER_TYPE.ADMIN)) {
    //   const data4createResponseObject = {
    //     req: req,
    //     result: -1,
    //     message: messages.NOT_AUTHORIZED,
    //     payload: {},
    //     logPayload: false,
    //   };
    //   return res
    //     .status(enums.HTTP_CODES.UNAUTHORIZED)
    //     .json(utils.createResponseObject(data4createResponseObject));
    // }

    const { id, email } = req.query;
    try {
      if (id && email == undefined) {
        // let user = await global.models.GLOBAL.USERQUESTIONSET.find({
        //   Qsetid: id,
        // })
        //   .populate({ path: "Qsetid", model: "questionset" })
        //   .populate({ path: "menus", model: "menu" })
        //   .populate({ path: "subMemus", model: "submenu" });
        let user = await global.models.GLOBAL.USERQUESTIONSET.aggregate([
          {
            $match: { Qsetid: ObjectId(id) },
          },
          {
            $lookup: {
              from: "user",
              let: { email: "$email", qsetid: "$Qsetid" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$$email", "$email"] },
                        { $eq: ["$$qsetid", "$Qsetid"] },
                      ],
                    },
                  },
                },
              ],
              as: "response",
            },
          },
          {
            $unwind: "$response",
          },
          {
            $lookup: {
              from: "questionset",
              localField: "Qsetid",
              foreignField: "_id",
              as: "questionset",
            },
          },
        ]);
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: { user },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      if (email && id) {
        var result = await global.models.GLOBAL.USER.findOne({
          email: email,
          Qsetid: id,
        });
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.SUCCESS,
          payload: { result },
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      //   console.log("result", result);
      //   if (user.length == 0) {
      //     const data4createResponseObject = {
      //       req: req,
      //       result: -1,
      //       message: messages.NOT_FOUND,
      //       payload: {},
      //       logPayload: false,
      //     };
      //     res
      //       .status(enums.HTTP_CODES.OK)
      //       .json(utils.createResponseObject(data4createResponseObject));
      //   }
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
