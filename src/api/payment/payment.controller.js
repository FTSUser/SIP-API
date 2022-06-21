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
//console.log("stripe", stripe);
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
    menus: Joi.array().required(),
    isPaymentDone: Joi.boolean(),
    PaymentId: Joi.string(),
    isAprove: Joi.boolean(),
    isPackage: Joi.boolean(),
    isRequested: Joi.boolean(),
    // imagePath: Joi.string().allow("")
  }),
  // * Music payment
  pay: async (req, res, next) => {
    const {
      Aid,
      email,
      menus,
      isPackage,
      isPaymentDone,
      isAprove,
      isRequested,
      PaymentId,
    } = req.body;
    const { user } = req;
    if (user.type !== enums.USER_TYPE.ADMIN) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_AUTHORIZED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(Utils.createResponseObject(data4createResponseObject));
    }
    if (!Aid || !menus || !email) {
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
    try {
      let superadmin = await global.models.GLOBAL.ROLE.findOne({
        roleName: "superadmin",
      });
      let findSuperAdmin = await global.models.GLOBAL.ADMIN.findOne({
        role: superadmin._id,
      });
      // const userExist = await global.models.GLOBAL.PAYMENT.find({ email: email });
      // if (!userExist) {
      //   return res
      //     .status(httpStatus.NOT_FOUND)
      //     .send(new APIResponse(Utils.messages.NO_USER_FOUND));
      // }
      // const checkMenu = await global.models.GLOBAL.PURCHASEHISTORY.find({ Aid: Aid });
      // if (checkMenu.length > 0) {
      //   const data4createResponseObject = {
      //     req: req,
      //     result: -400,
      //     message: messages.EXISTS_MENU,
      //     payload: {},
      //     logPayload: false
      //   };
      //   // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      //   // return;
      // }
      if (isPackage) {
        amount = 180;
      } else {
        amount = menus.length * 75;
      }
      const PURCHASEHISTORYDATA =
        await global.models.GLOBAL.PURCHASEHISTORY.find({ Aid: Aid }).sort({
          startDate: -1,
        });
      let checkPayment = await global.models.GLOBAL.PURCHASEHISTORY.find({
        Aid: Aid,
        email: email,
        menus: { $all: menus },
        isRequested: true,
        isAprove: false,
      });
      if (checkPayment.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.EXISTS_PURCHASE_HISTORY,
          payload: {},
          logPayload: false,
        };
        return res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(Utils.createResponseObject(data4createResponseObject));
      }
      let menusdata;
      if (PURCHASEHISTORYDATA.length > 0) {
        menusdata = [menus, ...PURCHASEHISTORYDATA[0]?.menus];
      } else {
        menusdata = menus;
      }
      let AmenintiesCreate = {
        Aid: Aid,
        email: email,
        menus: menusdata,
        isPaymentDone: false,
        PaymentId: null,
        isAprove: false,
        isRequested: true,
      };
      const newAmeninties = await global.models.GLOBAL.PURCHASEHISTORY(
        AmenintiesCreate
      );
      await newAmeninties.save();
      const notification = await global.models.GLOBAL.NOTIFICATION.create({
        type: "Purchase Submenu Request",
        receiver: findSuperAdmin._id,
        sender: Aid,
      });
      console.log("1menus", newAmeninties);
      console.log("2menus", AmenintiesCreate);
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.PAYMENT_SUCCESS,
        payload: { newAmeninties },
        logPayload: false,
      };
      // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: "accept_a_payment" },
        receipt_email: email,
        payment_method_types: ["card"],
        // receipt_menus: menus,
        description: "Payment of Music, Album, Product or Service",
      });
      // const charge = await stripe.charges.create({
      //   amount: 2000,
      //   currency: 'usd',
      //   source: 'tok_visa',
      //   description: 'My First Test Charge (created for API docs)',
      // });
      res
        .status(httpStatus.OK)
        .send(
          new APIResponse(
            { client_secret: paymentIntent["client_secret"] },
            messages.SUCCESS_PAYMENT,
            newAmeninties
          )
        );
    } catch (error) {
      console.log(error);
      next();
    }
  },

  confirmPayment: async (req, res, next) => {
    const {
      Aid,
      PaymentId,
      email,
      // productId,
      amount,
      menus,
      // type,
      id,
      // size,
      // quantity,
      // address,
      // country,
      // zip,
      // firstName,
      // lastName,
      // service
    } = req.body;
    console.log("req.body", req.body);
    // const {  } = req.params;
    const { user } = req;
    if (user.type !== enums.USER_TYPE.ADMIN) {
      console.log("paymentId", PaymentId);
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_AUTHORIZED,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.UNAUTHORIZED)
        .json(Utils.createResponseObject(data4createResponseObject));
    }
    if (!id || !Aid) {
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

    try {
      const userExist = await global.models.GLOBAL.PURCHASEHISTORY.findOne({
        email: email,
      });
      console.log("userExsit", userExist);
      if (!userExist) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send(new APIResponse(Utils.messages.NO_USER_FOUND));
      }

      const Item = await global.models.GLOBAL.PURCHASEHISTORY.findById({
        _id: id,
      });
      if (!Item) {
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.ITEM_NOT_FOUND,
          payload: {},
          logPayload: false,
        };
        // res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
      } else {
        // const checkQuestion = await global.models.GLOBAL.PURCHASEHISTORY.find({Aid:Aid});

        const Item =
          await global.models.GLOBAL.PURCHASEHISTORY.findByIdAndUpdate(
            { _id: id },
            { isPaymentDone: true, PaymentId: PaymentId }
          );
        // const data4createResponseObject = {
        //   req: req,
        //   result: 0,
        //   message: messages.ITEM_UPDATED,
        //   payload: {},
        //   logPayload: false
        // };
        //  res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));

        console.log("tttttttttttt");
        const PURCHASEHISTORYDATA =
          await global.models.GLOBAL.PURCHASEHISTORY.find({ Aid: Aid }).sort({
            startDate: -1,
          });
        console.log("paymentDataaaaaa", PaymentId);

        // const paymentIntent = await stripe.paymentIntents.confirm(
        //   PaymentId,
        //   { payment_method: 'pm_card_visa' }
        // );
        // console.log("paymentIntentpaymentIntent", paymentIntent);

        // let menusdata = [...menus, ...PURCHASEHISTORYDATA[0].menus]
        const paymentData = await global.models.GLOBAL.PAYMENT({
          // userId: req.currentUser._id,
          PaymentId: PaymentId,
          paymentAmount: amount,
          // paymentIntent: paymentIntent,
          menus: PURCHASEHISTORYDATA[0].menus,
          // productId: productId,
          // productCategory: type === "music" ? "Music" : "product",
          // firstName: firstName,
          // lastName: lastName,
          email: email,
          // address: address,
          // country: country,
          // zip: zip,
        });
        console.log("paymentData---------", paymentData);
        await paymentData.save();

        // try {
        //   paymentData.save();
        // } catch (e) {
        //   res.send(e)
        // }
        // res.send(paymentData)
        // let transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST, // change this to your domain
        //     port: process.env.SMTP_PORT,
        //     secure: true,
        //     auth: {
        //       user: process.env.SMTP_FROM, // change this to your mail
        //       pass: process.env.SMTP_PASS, // change this to your mail password
        //     },
        //   });
        if (String(userExist.email) === String(email)) {
          console.log("MAIL SENDING");
          let transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
          });
          // console.log("tttttttttttt")
          let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "SIP Interview",
            html: `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap" rel="stylesheet">
      </head>
      <style>
          body {
              font-family: 'Ubuntu', sans-serif;
              background-color: #f5f5f5;
          }
      
          * {
              box-sizing: border-box;
          }
      
          p:last-child {
              margin-top: 0;
          }
      
          img {
              max-width: 100%;
          }
      </style>
      
      <body style="margin: 0; padding: 0;">
          <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                  <td style="padding: 20px 0 30px 0;">
                      <table align="center" cellpadding="0" cellspacing="0" width="600" style=" border-collapse: collapse; border: 1px solid #ececec; background-color: #fff;">
                          <tr>
                              <td align="center" style="position: relative;">
                                  <div
                                  class="company-logo-align"
                                  style=" padding: 2rem 2rem 1rem 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto;"
                                  align="center">

                                  </div>
                              </td>
                          </tr>
                          <tr>
                              <td>
                                  <div class="user-information" 
                                  style="padding: 25px; background-color: #021f4c; width: 91.6%;"
                                  >
                                  <p align="center" style="color: #fff; font-size: 30px; font-weight: 500; margin: 0 0 1rem 0;">Welcome to SIP Interview®</p>
                                  <span align="center" style="display: block; font-size: 16px; color: #fff;">Thank you for purchase course on SIP Interview®</span>
                                  </div>
                                
                              </td>
                              <td></td>
                          </tr>
                          
                          <tr>
                              <td style="padding: 3rem 2rem 2rem 2rem;">
                                <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">
                                  If you have any query, feel free to contact us at support@sipinterview.com.
                                </p>
                              </td>
                          </tr>
                        
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      
      </html>`,
          });
          // console.log("zzzzzzzzzz")
          console.log("Message sent: %s", info.messageId);
        }
        //   entry = global.models.GLOBAL.PAYMENT({
        //     email: email,
        //     paymentData:paymentData
        //     // date: Date.now(),
        //     // expirationDate: Date.now() + 300 * 1000,
        //     // failedAttempts: 0,
        // });
        // logger.info("/verify-email - Saving verification-code in database");
        // try {
        //   await paymentData.save();
        // } catch (error) {
        //   logger.error(
        //     `/verify-email - Error while saving code in database: ${error.message}\n${error.stack}`
        //   );
        //   const data4createResponseObject = {
        //     req: req,
        //     result: -1,
        //     message: messages.FAILED_VERIFICATION,
        //     payload: {},
        //     logPayload: false,
        //   };
        //   // return res
        //   //   .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        //   //   .json(utils.createResponseObject(data4createResponseObject));
        // }
        const data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.PAYMENT_SUCCESS,
          payload: {},
          logPayload: false,
        };
        res.send(paymentData);
      }
    } catch (e) {
      res.send(e);
    }
  },

  // if (service != null) {
  //   const serviceData = new ServicePay({
  //     name: service.name,
  //     email: service.email,
  //     tel: service.tel,
  //     artist: service.artist,
  //     song: service.song,
  //     genre: service.genre,
  //     reference: service.reference,
  //     describe: service.describe,
  //     download: service.download,
  //     packageId: service.packageId,
  //     serviceId: service.serviceId,
  //   });
  //   await serviceData.save();
  // }

  // if (type === "music") {
  //   //const music_artist_id = await Music.findById(productId);
  //   //console.log(music_artist_id);
  //   await Music.findByIdAndUpdate(productId, {
  //     $inc: { purchases: 1 },
  //   });
  //   userExist.musicPurchased.push(productId);
  //   userExist.save();

  // const artistPayoutexist = await ArtistPayout.findById({
  //   artistId: mongoose.Schema.Types.ObjectId(music_artist_id.artistId),
  // });

  // if (!artistPayoutexist) {
  //   const artistPayoutData = new ArtistPayout({
  //     artistId: mongoose.Schema.Types.ObjectId(music_artist_id.artistId),
  //     productCategory: "Music",
  //     paymentAmount: amount,
  //     paymentId: paymentIntent.id,
  //     musicId: productId,
  //     productId: [],
  //   });
  //   await artistPayoutData.save();
  // } else {
  //   const artistPayoutexist = await ArtistPayout.findByIdAndUpdate(
  //     mongoose.Schema.Types.ObjectId(music_artist_id),
  //     {
  //       artistId: mongoose.Schema.Types.ObjectId(
  //         music_artist_id.artistId
  //       ),
  //       productCategory: "Music",
  //       paymentAmount: artistPayoutexist + amount,
  //       paymentId: paymentIntent.id,
  //       musicId: productId,
  //       productId: artistPayoutexist.productId,
  //     }
  //   );
  // }

  // var orderItems = await Music.findById(productId, {
  //   musicTitle: 1,
  //   musicDesc: 1,
  //   amount: 1,
  //   musicImage: 1,
  //   genre: 1,
  //   country: 1,
  //   musicUrl: 1,
  // });

  // const orderData = new Order({
  //   userId: req.currentUser._id,
  //   productCategory: "Music",
  //   productId: productId,
  //   status: "Completed",
  //   orderDetail: {
  //     musicTitle: orderItems.musicTitle,
  //     musicDesc: orderItems.musicDesc,
  //     amount: orderItems.amount,
  //     musicImage: orderItems.musicImage,
  //     genre: orderItems.genre,
  //     country: orderItems.country,
  //     musicUrl: orderItems.musicUrl,
  //     status: "Completed",
  //   },
  // });

  //   await orderData.save();
  // } else if (type === "product") {
  //   //const product_artist_Id = await Product.findById(productId);

  //   let orderDetails = [];
  //   if (productId) {
  //     for (let i = 0; i < productId.length; i++) {
  //       await Product.findByIdAndUpdate(productId[i], {
  //         $inc: { purchases: 1 },
  //       });

  // const artistPayoutexist = await ArtistPayout.findById({
  //   artistId: mongoose.Schema.Types.ObjectId(
  //     product_artist_Id.artistId
  //   ),
  // });

  // if (!artistPayoutexist) {
  //   const artistPayoutData = new ArtistPayout({
  //     artistId: product_artist_Id.artistId,
  //     productCategory: "Product",
  //     paymentAmount: amount,
  //     paymentId: paymentIntent.id,
  //     musicId: [],
  //     productId: productId,
  //   });
  //   await artistPayoutData.save();
  // } else {
  //   const artistPayoutexist = await ArtistPayout.findByIdAndUpdate(
  //     mongoose.Schema.Types.ObjectId(product_artist_Id),
  //     {
  //       artistId: mongoose.Schema.Types.ObjectId(
  //         product_artist_Id.artistId
  //       ),
  //       productCategory: "Product",
  //       paymentAmount: artistPayoutexist + amount,
  //       paymentId: paymentIntent.id,
  //       musicId: artistPayoutexist.musicId,
  //       productId: productId,
  //     }
  //   );
  // }

  //           var items = await Product.findById(productId[i], {
  //             title: 1,
  //             image: 1,
  //             description: 1,
  //             price: 1,
  //             type: 1,
  //             artistId: 1,
  //           });

  //           var orderItems = {
  //             _id: new ObjectID(),
  //             productId: items._id,
  //             artistId: items.artistId,
  //             title: items.title,
  //             image: items.image,
  //             description: items.description,
  //             price: items.price,
  //             type: items.type,
  //             size: size[i],
  //             quantity: quantity[i],
  //             status: "New Order",
  //           };
  //           orderDetails.push(orderItems);
  //         }
  //       }

  //       const orderData = new Order({
  //         userId: req.currentUser._id,
  //         productCategory: "product",
  //         productId: productId,
  //         status: "New Order",
  //         orderDetail: orderDetails,
  //       });
  //       await orderData.save();
  //       await cart.deleteMany({ userId: req.currentUser._id });
  //     }
  //     res
  //       .status(httpStatus.OK)
  //       .send(
  //         new APIResponse(
  //           { success: true },
  //           Utils.messages.SUCCESS_PAYMENT
  //         )
  //       );
  //   } catch (error) {
  //     console.log(error);
  //     next();
  //   }
  // },

  // payProduct: async (req, res, next) => {
  //   const { email } = req.body;

  //   try {
  //     const userExist = await User.findById(req.currentUser._id);
  //     if (!userExist) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //     }

  //     res
  //       .status(httpStatus.OK)
  //       .send(new APIResponse(response, Utils.messages.SUCCESS_PAYMENT));
  //   } catch (error) {
  //     console.log(error);
  //     next();
  //   }
  // },

  // Donate: async (req, res, next) => {
  //   const {
  //     artistId,
  //     email,
  //     amount,
  //   } = req.body;
  //   console.log("req.body", req.body);
  //   const artistExist = await Artist.findById(artistId);
  //   if (!artistExist) {
  //     return res
  //       .status(httpStatus.NOT_FOUND)
  //       .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //   }
  //   try {
  //     const userExist = await User.findById(req.currentUser._id);
  //     if (!userExist) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //     }

  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(amount * 100),
  //       currency: "usd",
  //       // Verify your integration in this guide by including this parameter
  //       metadata: { integration_check: "accept_a_payment" },
  //       receipt_email: email,
  //       description: "Donation to " + artistExist.artistName,
  //     });

  //     res
  //       .status(httpStatus.OK)
  //       .send(
  //         new APIResponse(
  //           { client_secret: paymentIntent["client_secret"] },
  //           Utils.messages.SUCCESS_PAYMENT
  //         )
  //       );
  //   } catch (error) {
  //     console.log(error);
  //     next();
  //   }
  // },

  // confirmDonation: async (req, res, next) => {
  //   const {
  //     artistId,
  //     email,
  //     amount,
  //     address,
  //     country,
  //     firstName,
  //     lastName,
  //     description,
  //     paymentIntentId
  //   } = req.body;
  //   console.log("req.body", req.body);
  //   const artistExist = await Artist.findById(artistId);
  //   if (!artistExist) {
  //     return res
  //       .status(httpStatus.NOT_FOUND)
  //       .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //   }
  //   try {
  //     const userExist = await User.findById(req.currentUser._id);
  //     if (!userExist) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //     }

  //     const newDonation = new Donation({
  //       userId: req.currentUser._id,
  //       artistId: artistId,
  //       amount: amount,
  //       paymentId: paymentIntentId,
  //       paymentAmount: amount,
  //       firstName: firstName,
  //       lastName: lastName,
  //       email: email,
  //       address: address,
  //       country: country,
  //       description: description,
  //     });

  //     await newDonation.save();

  //         let transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST, // change this to your domain
  //   port: process.env.SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.SMTP_FROM, // change this to your mail
  //     pass: process.env.SMTP_PASS, // change this to your mail password
  //   },
  // });

  //     let info = await transporter.sendMail({
  //       from: process.env.SMTP_FROM, // sender address
  //       to: email, // list of receivers
  //       subject: "Donation Done", // Subject line
  //       html: `<p>Hi there!, <b>${userExist.firstName + " " + userExist.lastName
  //         }</b></p>
  //       <p>Thank You for showing us how much you love our artist.</p>

  //       <p>Your Payment for artist <b>${artistExist.artistName
  //         }</b> donation is completed successfully.</p>

  //       <p>This email is not used for communication purposes. If you need to get in touch with us please contact us at <a href="mailto:info@7thcentury.co.uk">info@7thcentury.co.uk</a></p>

  //       <p>Alternatively,  if you have any questions regarding our products or services, feel free  to visit our frequently asked questions (F.A.Q's) page by clicking <a href="https://www.7thcentury.co.uk/questions">HERE</a>.</p>

  //       <p>If you think this message has been sent to you in error, please contact our Support Team at <a href="mailto:info@7thcentury.co.uk">info@7thcentury.co.uk</a>.</p>

  //       <p>Kind regards,</p>
  //       <p>The Team at 7th Century Music.</p>

  //       <p>Follow us on all social media platforms for all the latest news, educational material, music releases, events and MORE!<p>
  //       <p>
  //       <span>INSTAGRAM</span> &nbsp;&nbsp; &nbsp;&nbsp; <span>FACEBOOK</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span>TWITTER</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span>YOUTUBE</h2>
  //       </p>
  //       <a href="https://www.instagram.com/7th.century.music/">
  //       <img
  //         style="width: 90px; height: 90px"
  //         src="https://7thcentury-objects.s3.us-east-2.amazonaws.com/assets/instagram.png"
  //       />
  //       </a>
  //       <a href="https://www.facebook.com/7th-Century-Music-106256021766890">
  //       <img
  //         style="width: 90px; height: 90px"
  //         src="https://7thcentury-objects.s3.us-east-2.amazonaws.com/assets/facebook.png"
  //       />
  //       </a>
  //       <a href="https://twitter.com/7thcenturymedia?lang=en">
  //       <img
  //         style="width: 90px; height: 90px"
  //         src="https://7thcentury-objects.s3.us-east-2.amazonaws.com/assets/twitter.png"
  //       />
  //       </a>
  //       <a href="https://www.youtube.com/channel/UCZSMJE5tMI5QTyfWEOj1d2Q">
  //       <img
  //         style="width: 90px; height: 90px"
  //         src="https://7thcentury-objects.s3.us-east-2.amazonaws.com/assets/youtube.png"
  //       />
  //       </a>
  //       <p>
  //            <span>7th century music</span>
  //           <br>
  //             <a href="https://www.7thcentury.co.uk/">
  //               <img
  //                 style="width: 500px; height: 200px"
  //                 src="https://7thcentury-objects.s3.us-east-2.amazonaws.com/assets/7thcenturymusic.png"
  //             />
  //           </a>
  //           </p>

  //       <p>Disclaimer: </p>
  //       <p>This message contains confidential information and is intended only for the individual
  //       named. If you are not the named addressee, you should not disseminate, distribute
  //       or copy this email. Please notify the sender immediately by email if you have
  //       received this email by mistake and delete this email from your system. Email
  //       transmission cannot be guaranteed to be secure or error-free, as information could
  //       be intercepted, corrupted, lost, destroyed, arrive late or incomplete, or contain
  //       viruses. The sender, therefore, does not accept liability for any errors or omissions in
  //       the contents of this message which arise as a result of email transmission. If
  //       verification is required, please request a hard-copy version.
  //       </p>`,
  //     });

  //     console.log("info", info);

  //     res
  //       .status(httpStatus.OK)
  //       .send(
  //         new APIResponse(
  //           { success: true },
  //           Utils.messages.SUCCESS_PAYMENT
  //         )
  //       );
  //   } catch (error) {
  //     console.log(error);
  //     next();
  //   }
  // },
  //   getDonationDetails: async (req, res, next) => {
  //     let artistId, userId;
  //     let criteria = {};

  //     if (req.currentUser.role === "admin") {
  //       // const { artistId, userId } = req.query;
  //     } else if (req.currentUser.role === "artist") {
  //       artistId = mongoose.Types.ObjectId(req.currentUser._id);
  //       criteria["artistId"] = artistId;
  //     } else if (req.currentUser.role === "user") {
  //       userId = mongoose.Types.ObjectId(req.currentUser._id);
  //       criteria["userId"] = userId;
  //     } else if (req.currentUser.role === "manager") {
  //       userId = mongoose.Types.ObjectId(req.currentUser._id);
  //       criteria["userId"] = userId;
  //     }

  //     console.log("criteria", criteria);

  //     try {
  //       const findDonationDetails = await Donation.find(criteria).populate({
  //         path: "artistId",
  //         model: "Artist",
  //         select: "artistName realName",
  //       });
  //       return res
  //         .status(httpStatus.OK)
  //         .send(
  //           new APIResponse(findDonationDetails, Utils.messages.SUCCESS_FETCH)
  //         );
  //     } catch (error) {
  //       console.log(error);
  //       next();
  //     }
  //   },

  //   subscription: async (req, res, next) => {
  //     const { planId } = req.body;
  //     if (!planId) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.INVALID_DATA));
  //     }
  //     const artistExist = await Artist.findById(req.currentUser._id);
  //     console.log("artistExist", artistExist);
  //     if (!artistExist) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //     }
  //     const subscriptionPlan = await SubscriptionPlan.findById(ObjectID(planId));
  //     if (!subscriptionPlan) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.INVALID_DATA));
  //     }
  //     console.log("subscriptionPlan", subscriptionPlan);

  //     try {
  //       const paymentIntent = await stripe.paymentIntents.create({
  //         amount: Math.round(subscriptionPlan.price * 100),
  //         currency: "usd",
  //         // Verify your integration in this guide by including this parameter
  //         metadata: { integration_check: "accept_a_payment" },
  //         receipt_email: artistExist.email,
  //         description: "Subscription of " + subscriptionPlan.title,
  //       });

  //       res
  //         .status(httpStatus.OK)
  //         .send(
  //           new APIResponse(
  //             { client_secret: paymentIntent["client_secret"] },
  //             Utils.messages.SUCCESS_PAYMENT
  //           )
  //         );
  //     } catch (error) {
  //       console.log(error);
  //       next();
  //     }
  //   },

  //   confirmSubscription: async (req, res, next) => {
  //     const { planId } = req.body;
  //     if (!planId) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.INVALID_DATA));
  //     }
  //     const artistExist = await Artist.findById(req.currentUser._id);
  //     console.log("artistExist", artistExist);
  //     if (!artistExist) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.NO_USER_FOUND));
  //     }
  //     const subscriptionPlan = await SubscriptionPlan.findById(ObjectID(planId));
  //     if (!subscriptionPlan) {
  //       return res
  //         .status(httpStatus.NOT_FOUND)
  //         .send(new APIResponse(Utils.messages.INVALID_DATA));
  //     }
  //     console.log("subscriptionPlan", subscriptionPlan);

  //     try {

  //       var dateCancel = new Date();
  //       dateCancel.setDate(dateCancel.getDate() + 365);

  //       await Artist.findOneAndUpdate(
  //         {
  //           _id: req.currentUser._id,
  //           isActive: true,
  //         },
  //         {
  //           isRegistered: true,
  //         }
  //       );

  //       const changeLeftMusic = await Artist.findByIdAndUpdate(
  //         { _id: req.currentUser._id },
  //         {
  //           plan_details: [
  //             {
  //               totalMusic_credit: parseInt(subscriptionPlan.songs),
  //               usedMusic_credit: 0,
  //               leftMusic_credit: parseInt(subscriptionPlan.songs),
  //               totalProduct_credit: parseInt(subscriptionPlan.products),
  //               usedProduct_credit: 0,
  //               leftProduct_credit: parseInt(subscriptionPlan.products),
  //             },
  //           ],
  //           plan_type: subscriptionPlan.type,
  //         }
  //       );
  //       const artist = new Primeuser({
  //         artist_id: req.currentUser._id,
  //         subscription_id: subscriptionPlan._id,
  //         plan_type: subscriptionPlan.type,
  //         date_start: Date.now(),
  //         date_end: dateCancel,
  //         planId: subscriptionPlan._id,
  //       });
  //       await artist.save();
  //       isprime = true;

  //       const transaction = new Transaction({
  //         artist_id: req.currentUser._id,
  //         payment_receipt: null,
  //         payment_amount: subscriptionPlan.price,
  //         date_end: dateCancel,
  //         plan_type: subscriptionPlan.type,
  //         isActive: true,
  //       });
  //       transactionDetails = await transaction.save();

  //       // send mail to the user
  //       let transporter = nodemailer.createTransport({
  //         host: process.env.SMTP_HOST, // change this to your domain
  //         port: process.env.SMTP_PORT,
  //         secure: true,
  //         auth: {
  //           user: process.env.SMTP_FROM, // change this to your mail
  //           pass: process.env.SMTP_PASS, // change this to your mail password
  //         },
  //       });

  //       let info = await transporter.sendMail({
  //         from: process.env.SMTP_FROM, // sender address
  //         to: artistExist.email, // list of receivers
  //         subject: "Subscription Payment", // Subject line
  //         html: `<p>Hi there!, <b>${artistExist.artistName}</b> and welcome to 7th Century Music!</p>
  //         <p>Now that you have access to all the features and tools our platform has to offer, you'll be able to distribute, market and sell your music and more! The only limitation is your imagination.</p>
  //         <p>We want to give you the best start to building your music career. In order to make the most use of our platform and the tools available to you, you'll need to spend some time educating yourself on just how the platform works. This is why we've created several videos giving you the education and insight into how to successfully market, distribute and most importantly sell your music to fans both new and old!</p>

  //         <p>Make sure you subscribe to our YouTube channel <a href="https://www.youtube.com/channel/UCZSMJE5tMI5QTyfWEOj1d2Q">HERE</a>. We're constantly uploading new content to help you become truly independent as an artist. We're also going to be expanding our content and working with other professionals and creatives in the music industry. Our aim is to bring you education AND entertainment so make sure you subscribe and don't forget to turn the notification bell ON.</p>
  //         <p>Follow us on all our social media platforms and join our facebook community <a href="https://www.facebook.com/groups/415316836869626">HERE</a>. Here you'll be able to connect with fellow artists, creatives and professionals. Our Facebook groups are meant to help artists connect, share experiences and knowledge with one another. This is your space, so feel free to join and invite other like minded creatives. </p>
  //         <p>This email is not used for communication purposes. If you need to get in touch with us please contact us at <a href="mailto:info@7thcentury.co.uk">info@7thcentury.co.uk</a></p>

  //         <p>Alternatively,  if you have any questions regarding our products or services, feel free  to visit our frequently asked questions (F.A.Q's) page by clicking <a href="https://www.7thcentury.co.uk/questions">HERE</a>.</p>

  //         <p>If you think this message has been sent to you in error, please contact our Support Team at <a href="mailto:info@7thcentury.co.uk">info@7thcentury.co.uk</a>.</p>

  //         <p>Kind regards,</p>
  //         <p>The Team at 7th Century Music.</p>

  //         <p>Follow us on all social media platforms for all the latest news, educational material, music releases, events and MORE!<p>

  //         <p>Disclaimer: </p>
  //         <p>This message contains confidential information and is intended only for the individual
  //         named. If you are not the named addressee, you should not disseminate, distribute
  //         or copy this email. Please notify the sender immediately by email if you have
  //         received this email by mistake and delete this email from your system. Email
  //         transmission cannot be guaranteed to be secure or error-free, as information could
  //         be intercepted, corrupted, lost, destroyed, arrive late or incomplete, or contain
  //         viruses. The sender, therefore, does not accept liability for any errors or omissions in
  //         the contents of this message which arise as a result of email transmission. If
  //         verification is required, please request a hard-copy version.
  //         </p>`,
  //       });

  //       console.log("info", info);

  //       res
  //         .status(httpStatus.OK)
  //         .send(
  //           new APIResponse(
  //             { success: true },
  //             Utils.messages.SUCCESS_PAYMENT
  //           )
  //         );
  //     } catch (error) {
  //       console.log(error);
  //       next();
  //     }
  //   },
  //   // subscription: async (req, res, next) => {
  //   //   const { title, amount  } = req.body;
  //   //   try {

  //   //     // const product = await stripe.products.create({
  //   //     //   name: title,
  //   //     // });
  //   //     // console.log("product", product)
  //   //     // const price = await stripe.prices.create({
  //   //     //   unit_amount: amount * 100,
  //   //     //   currency: 'usd',
  //   //     //   product: product.id,
  //   //     // });
  //   //     console.log("priceUpdate")

  //   //     await stripe.prices.update(
  //   //       'price_1JpWKcGwp0msmDCRp3jVY3qc',
  //   //       {unit_amount: amount * 100}
  //   //     ).then((priceUpdate) => {
  //   //       console.log("priceUpdate", priceUpdate)
  //   //     }).catch((err)=> {
  //   //       console.log("errr", err)
  //   //     });
  //   //     const data = {
  //   //       priceUpdate
  //   //     }
  //   //     return res
  //   //       .status(httpStatus.OK)
  //   //       .send(
  //   //         new APIResponse(data,
  //   //           Utils.messages.SUCCESS_FETCH
  //   //         )
  //   //       );
  //   //   } catch (error) {
  //   //     return res
  //   //       .status(httpStatus.OK)
  //   //       .send(
  //   //         new APIResponse("error",
  //   //           Utils.messages.SUCCESS_FETCH
  //   //         )
  //   //       );
  //   //   }
  //   // },

  //   Payout: async (req, res, next) => {
  //     try {
  //       // console.log("object", req.body.amount);
  //       // const paymentIntent = await stripe.paymentIntents.create({
  //       //   payment_method_types: ['card'],
  //       //   amount: 1000,
  //       //   currency: 'usd',
  //       //   on_behalf_of: 'acct_1J67yVSILrrlvuAL'
  //       // });
  //       const transfer = await stripe.transfers.create({
  //         amount: 3,
  //         currency: "gbp",
  //         destination: "acct_1JFtA8RYfhvzLLex",
  //       });
  //       res
  //         .status(httpStatus.OK)
  //         .send(new APIResponse(transfer, Utils.messages.SUCCESS_PAYMENT));
  //     } catch (error) {
  //       console.log(error);
  //       next();
  //     }
  //   },
  // };
  // // const payout = await stripe.payouts.create({
  // //   amount: 1000,
  // //   currency: 'gbp',
  // //   method: 'instant',
  // //   destination: 'card_xyz',
  // // });
  // // const transfer = await stripe.payouts.create(
  // //   {
  // //     amount: 100,
  // //     currency: "usd",
  // //     method: "instant",
  // //     source_type: "card",
  // //     destination: "card_1Gk3XBAaf3EX2XJtXdruEv9N",
  // //   },
  // //   {
  // //     stripeAccount: "acct_1JFtA8RYfhvzLLex",
  // //   }
  // );
};
