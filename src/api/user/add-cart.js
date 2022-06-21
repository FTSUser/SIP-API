const enums = require("../../../json/enums.json");
const Joi = require("joi");
const logger = require("../../logger");
const messages = require("../../../json/messages.json");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

module.exports = exports = {
  // route validation
  validation: Joi.object({
    id: Joi.string().required(),
    unit: Joi.string().required(),
    unitList: Joi.string().allow(),
  }),
  // route handler
  handler: async (req, res) => {
    const { qty, deviceId, isConfirmed } = req.query;
    const { id, unit, unitList } = req.body;

    let userDetail;
    if (req.headers.authorization) {
      userDetail = await utils.getHeaderFromToken(req.headers.authorization);
    }

    try {
      // store cart to cart schema if user not logged in
      // else store cart to user schema

      // find product
      const product = await global.models.GLOBAL.PRODUCT.findById(id);
      if (!product) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }
      const shop = await global.models.GLOBAL.SHOP.findById(product.shopId);
      if (!shop) {
        const data4createResponseObject = {
          req: req,
          result: -1,
          message: messages.SHOP_NOT_FOUND,
          payload: {},
          logPayload: false, 
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
      }

      if (userDetail) {
        // check shop exist in user cart
        const shopExist = await global.models.GLOBAL.USER.find({
          _id: userDetail.id,
          "status.name": "active",
          "cart.shopId": { $eq: shop._id },
        });
        // check product exist in user cart
        const productExist = await global.models.GLOBAL.USER.find({
          _id: userDetail.id,
          "status.name": "active",
          "cart.$[elem].products": { $eq: product._id },
        },
        {
          arrayFilters: [{ "elem.shopId": product.shopId }],
        });

        let qtyValue = qty === "inc" ? 1 : qty === "dec" ? -1 : null;
        if (productExist.length > 0) {
          await global.models.GLOBAL.USER.findOneAndUpdate(
            {
              _id: userDetail.id,
              "status.name": "active"
            },
            {
              $inc: { "cart.$[elem].qty": qtyValue },
            },
            {
              arrayFilters: [{ "elem.productId": product._id }],
              upsert: true,
            }
          );
        } else { 
          const cartData = {
            shopId: product.shopId,
            products:[
              {
                productId: product._id,
                unit: unit,
                unitList: unitList,
                qty: qtyValue,
              }
            ] 
          };
          await global.models.GLOBAL.USER.findOneAndUpdate(
            {
              _id: userDetail.id,
              "status.name": "active"
            },
            {
              $push: { cart: cartData },
            },
            {
              upsert: true,
            }
          );
        }
        const data4createResponseObject = {
          req: req,
          result: 0,
          message:
            qty === "inc"
              ? messages.ITEM_ADDED
              : qty === "dec"
              ? messages.ITEM_REMOVED
              : null,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {
        // check product exist in device cart
        const productExist = await global.models.GLOBAL.CART.find({
          deviceId: deviceId,
          "cart.productId": { $eq: product._id },
        });

        let qtyValue = qty === "inc" ? 1 : qty === "dec" ? -1 : null;
        if (productExist.length > 0) {
          await global.models.GLOBAL.CART.findOneAndUpdate(
            {
              deviceId: deviceId,
            },
            {
              $inc: { "cart.$[elem].qty": qtyValue },
            },
            {
              arrayFilters: [{ "elem.productId": product._id }],
              upsert: true,
            }
          );
        } else {
          const cartData = {
            shopId: product.shopId,
            productId: product._id,
            unit: unit,
            unitList: unitList,
            qty: qtyValue,
          };
          await global.models.GLOBAL.CART.findOneAndUpdate(
            {
              deviceId: deviceId,
            },
            {
              $push: { cart: cartData },
            },
            {
              upsert: true,
            }
          );
        }
        const data4createResponseObject = {
          req: req,
          result: 0,
          message:
            qty === "inc"
              ? messages.ITEM_ADDED
              : qty === "dec"
              ? messages.ITEM_REMOVED
              : null,
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
