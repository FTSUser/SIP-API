const Joi = require("joi");
const Utils = require("../../utils");
const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIResponse = require("../../APIResponse");
// const Payment = require("./payment.model");
// const Order = require("../order/order.model");
// const User = require("../users/users.model");
// const Music = require("../music/music.model");
// const Product = require("../product/product.model");
// const Donation = require("./donation.model");
// const cart = require("../cart/cart.model");
// const { find } = require("../music/music.model");
// const Artist = require("../artist/artist.model");
// const ServicePay = require("../service/servicePay.model");
// const SubscriptionPlan = require("../subscriptionPlan/subscriptionPlan.model");
// const Primeuser = require("../subscription/primeuser.model");
// const Transaction = require("../subscription/subscription.model");
const stripe = require("stripe")(
  "sk_test_51Ktqe8SFgjNQxvYerXWUxBt4qXDkwaoXmth2Ly8XoQDBXK1vrsMbB2yqZgH8DAbnABWHoTnkIzMsbZ36K272dHGo00qbZGRj6T"
);
// console.log("stripetttttttttttttttttt", stripe);
// const paymentIntent = require('stripe')('pi_3KEuJ2SJCVT2nRrf1muzKPiO_secret_qGjxrLcSPyQhL4d3Qe0MmXuZw')
// console.log("paymenttttttttttttttt", paymentIntent)
// const stripe = require("stripe")(`${process.env.stripe_sk_test}`);
var ObjectID = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
const enums = require("../../../json/enums.json");
const { verifyEmail } = require("../admin");
// const utils = require("../../utils");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");

module.exports = {
  validation: Joi.object({
    Aid: Joi.string().required(),
    email: Joi.string().required(),
    // isPaymentDone: Joi.boolean(),
    PaymentId: Joi.string(),
    status: Joi.string(),
    refundId: Joi.object(),
    //   isAprove: Joi.boolean(),
    isPackage: Joi.boolean(),
    // charge:Joi.string()
    // imagePath: Joi.string().allow("")
  }),
  refund: async (req, res) => {
    const { Aid, email, PaymentId, chargeId } = req.body;
    const { user } = req;
    // if (user.type !== enums.USER_TYPE.SUPERADMIN) {
    //     const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: messages.NOT_AUTHORIZED,
    //         payload: {},
    //         logPayload: false
    //     };
    //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(Utils.createResponseObject(data4createResponseObject));
    // }
    if (!Aid || !email || !PaymentId) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FILL_DETAILS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(Utils.createResponseObject(data4createResponseObject));
    }
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
    try {
      const userExist = await global.models.GLOBAL.PURCHASEHISTORY.find({
        email: email,
        PaymentId: PaymentId,
      });
      console.log("userExist", userExist);
      if (!userExist) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send(new APIResponse(Utils.messages.NO_USER_FOUND));
      }

      // Refund of amount
      // const refund = await stripe.refunds.create(
      //  paymentIntent
      // )
      // console.log("refund done", refund)
      // const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

      // const refund = await paymentIntent.refunds.create({
      //     charge: req.body.PaymentId.clientSecret
      // });
      // const refunds = await stripe.refunds.retrieve(
      //     PaymentId.clientSecret
      //   );
      // console.log("refund ", refunds)
      // const paymentIntent = await stripe.paymentIntents.update(
      //     'pi_3KEv00SJCVT2nRrf0bXloFNg',
      //     {status: "requires_payment_method"}
      //   );
      const refund = await stripe.refunds.create({
        // charge: 'ch_3KFASMSJCVT2nRrf0i2OWn9y',
        charge: chargeId,
      });
      console.log("refund", refund);
      const paymentIntent = await stripe.paymentIntents.retrieve(
        // 'pi_3KFASMSJCVT2nRrf0AVk3g1e'
        PaymentId
      );
      console.log("payment Intent", paymentIntent);
      res.send(paymentIntent);
      // const paymentIntent = await stripe.paymentIntents.cancel(
      //     'pi_3KF9XmSJCVT2nRrf0AB5Lt9I'
      //   );
      //   console.log("refund ", paymentIntent)
      //   res.send("update done")
      //   const paymentIntents = await stripe.paymentIntents.capture(
      //     'pi_3KEv00SJCVT2nRrf0bXloFNg'
      //   );
      //     console.log("paymentIntent ", paymentIntents)

      // console.log("refund", refund)
      // var d = await usersubscribe.find({ Event_id: req.body.Event_id }).remove().exec()
      // console.log("darta query ",d)
      // debugger;
      // return res.send({ "msg": "refund", "res": refund })
      // const datacreateResponseObject = {
      //     req: req,
      //     result: -1,
      //     message: messages.SUCCESS,
      //     payload: {paymentIntent:paymentIntent},
      //     logPayload: false
      // };
      // return res.status(enums.HTTP_CODES.BAD_REQUEST).json(Utils.createResponseObject(datacreateResponseObject));

      // console.log("saverefund", saverefund)
      // let saverefund = await global.models.GLOBAL.PAYMENTREFUND({
      //     refundId: refundId,
      //     PaymentId: PaymentId,
      //     email: email

      // })
      // saverefund.save()
    } catch (error) {
      console.log(error);
    }
  },
};
