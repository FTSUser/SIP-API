const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Retrieve and return get all shop from the database.
module.exports = exports = {
  // route validation

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    if (!user) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      // Return get all shop
      let userData = await global.models.GLOBAL.USER.findOne({ _id: user._id,"status.name": "active" })
        .populate({ path: "favorites", model: "shop", populate: { path: "categories", model: "category"} });
      if (userData.favorites.length) {
        // for(let i = 0; i < userData.favorites.length; i++) {
        //     // let shopList = await global.models.GLOBAL.VENDOR.findOne({ "vendorShop._id": userData.favorites[i] },{vendorShop: 1});
        //     let favoriteShop = await global.models.GLOBAL.VENDOR.findOne(
        //         {"vendorShop._id": userData.favorites[i]},
        //         {_id: 0, vendorShop: {$elemMatch: {_id: userData.favorites[i]}}});
        //     shopList.push(favoriteShop.vendorShop[0]);
        // }

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_FETCHED,
          payload: { favorites: userData.favorites },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.EMPTY,
          payload: {},
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
