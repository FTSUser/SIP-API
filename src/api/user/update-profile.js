const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// update profile of user
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().allow(),
    imagePath: Joi.string().allow(),
    name: Joi.string().allow(),
    phone: Joi.string().allow(),
    cart: Joi.array().allow(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { email, imagePath, name, phone } = req.body;
    const { cartUpdate, deviceId } = req.query;
    if (!user) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_AUTHORIZED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      if (!cartUpdate) {
        // Update profile of user passing updated details
        const updatedUser = await global.models.GLOBAL.USER.findOneAndUpdate(
          { _id: user._id, "status.name": "active" },
          {
            $set: {
              name: name || user.name,
              email: email || user.email,
              phone: phone || user.phone,
              imagePath: imagePath || user.imagePath,
            },
          },
          {
            new: true,
          }
        );

        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.USER_PROFILE_UPDATED,
          payload: {
            user: {
              email: updatedUser.email,
              imagePath: updatedUser.imagePath,
              name: updatedUser.name,
              phone: updatedUser.phone,
            },
          },
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.OK)
          .json(utils.createResponseObject(data4createResponseObject));
      } else {

        // find cart by deviceId
        const cartData = await global.models.GLOBAL.CART.findOne({
          deviceId: deviceId,
        }, { cart: 1, _id: 0 });


        if (cartData && cartData.cart.length > 0) {

          // add items to user's cart
          for (let i = 0; i < cartData.cart.length; i++) {
            // check product exist in cart
            const productExist = await global.models.GLOBAL.USER.find({
              _id: user._id,
              "status.name": "active",
              "cart.productId": { $eq: cartData.cart[i].productId },
            });

            // if product exist in cart then update quantity
            if (productExist.length > 0) {
              const quantity = cartData.cart[i].qty;
              await global.models.GLOBAL.USER.findOneAndUpdate(
                {
                  _id: user._id,
                  "status.name": "active"
                },
                {
                  $set: { "cart.$[elem].qty": quantity },
                },
                {
                  arrayFilters: [{ "elem.productId": cartData.cart[i].productId }],
                  upsert: true,
                }
              );
            } else {
                
              // if product not exist in cart then add product to cart
              await global.models.GLOBAL.USER.findOneAndUpdate(
                {
                  _id: user._id,
                  "status.name": "active"
                },
                {
                  $push: { cart: cartData.cart[i] },
                },
                {
                  upsert: true,
                }
              );
            }
          }

          // delete items from local cart
          await global.models.GLOBAL.CART.deleteMany({ deviceId: deviceId });

          const data4createResponseObject = {
            req: req,
            result: 0,
            message: messages.ITEM_ADDED,
            payload: {},
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
