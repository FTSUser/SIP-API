const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;

// Retrieve and return get all shop from the database.
module.exports = exports = {
  // route validation

  // route handler
  handler: async (req, res) => {
    const { deviceId } = req.query;
    let userDetail;
    if (req.headers.authorization) {
      userDetail = await utils.getHeaderFromToken(req.headers.authorization);
    }

    try {
      // Return get all cart data if user logged in
      // else get cart data using device Id

      if (userDetail) {
        let userData = await global.models.GLOBAL.USER.findOne({
          _id: userDetail.id,
          "status.name": "active"
        }).populate({
          path: "favorites",
          model: "shop",
          populate: { path: "categories", model: "category" },
        });
        if (userData.cart.length) {
          let item = [];
          let cartTotal = 0;
          for (let i = 0; i < userData.cart.length; i++) {
            const productData = await global.models.GLOBAL.PRODUCT.findById(
              ObjectId(userData.cart[i].productId),
              { name: 1, imagePath: 1, type: 1, price: 1, shopId: 1 }
            ).populate({
              path: "shopId",
              model: "shop",
              select: "name imagePath deliveryCharge",
            });

            let deliveryCharge;
            if(productData.shopId.deliveryCharge.chargeType){
              deliveryCharge = 0;
            } else {
              deliveryCharge = productData.shopId.deliveryCharge.chargeType
            }

            console.log("deliveryCharge", productData.shopId.deliveryCharge)
            
            const itemObj = {
              shopId: productData.shopId._id,
              shopName: productData.shopId.name,
              shopImage: productData.shopId.imagePath,
              // deliveryCharge: productData.shopId.deliveryCharge,
              productId: productData._id,
              name: productData.name,
              imagePath: productData.imagePath,
              type: productData.type,
              qty: userData.cart[i].qty,
              price: userData.cart[i].qty * productData.price,
              unit: userData.cart[i].unit,
              unitList: userData.cart[i].unitList,
            };
            cartTotal += itemObj.price;
            item.push(itemObj);
          }
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { cart: item, cartTotal: cartTotal },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.CART_EMPTY,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
      } else {
        let cartData = await global.models.GLOBAL.CART.findOne({
          deviceId: deviceId,
        });
        if (cartData !== null && cartData.cart.length) {
          let item = [];
          let cartTotal = 0;
          for (let i = 0; i < cartData.cart.length; i++) {
            const productData = await global.models.GLOBAL.PRODUCT.findById(
              ObjectId(cartData.cart[i].productId),
              { name: 1, imagePath: 1, type: 1, price: 1, shopId: 1 }
            ).populate({
              path: "shopId",
              model: "shop",
              select: "name imagePath deliveryCharge",
            });
            const itemObj = {
              shopId: productData.shopId._id,
              shopName: productData.shopId.name,
              shopImage: productData.shopId.imagePath,
              productId: productData._id,
              name: productData.name,
              imagePath: productData.imagePath,
              type: productData.type,
              qty: cartData.cart[i].qty,
              price: cartData.cart[i].qty * productData.price,
              unit: cartData.cart[i].unit,
              unitList: cartData.cart[i].unitList,
            };
            cartTotal += itemObj.price;
            item.push(itemObj);
          }
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_FETCHED,
            payload: { cart: item, cartTotal: cartTotal },
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        } else {
          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.CART_EMPTY,
            payload: {},
            logPayload: false,
          };
          res
            .status(enums.HTTP_CODES.OK)
            .json(utils.createResponseObject(data4createResponseObject));
        }
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
