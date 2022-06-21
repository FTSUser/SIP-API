/**
 * Controller to verify a specified phone number.
 * Created by Bhargav Butani on 09.07.2021
 */
 const _ = require("lodash");
 const Joi = require("joi");
 const jwt = require("jsonwebtoken");
 const ObjectId = require("mongodb").ObjectId;
 const enums = require("../../../json/enums.json");
 const messages = require("../../../json/messages.json"); 
 const logger = require("../../logger");
 const utils = require("../../utils");

 
 module.exports = exports = {
     // router validation
     validation: Joi.object({
         device: {
             os: Joi.string().allow(""),
             type: Joi.string().allow(""),
             version: Joi.string().allow(""),
             token: Joi.string().allow(""),
         },
         email: Joi.string().allow(""),
         location: {
             latitude: Joi.number().allow(0),
             longitude: Joi.number().allow(0)
         },
         name: Joi.string().required(),
         phone: Joi.string().required(),
         token: Joi.string().required()
     }),
 
     // route handler
     handler: async (req, res) => {
         let {
             device,
             email,
             location,
             name,
             phone,
             token
         } = req.body;
         if (!phone) {
             logger.error("Phone is mandatory.");
             const data4createResponseObject = {
                 req: req,
                 result: -400,
                 message: "Phone is mandatory.",
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
             return;
         }
         phone = phone.removeSpaces();
 
         if (!token || token.length === 0) {
             logger.error("Registration token is mandatory.");
             const data4createResponseObject = {
                 req: req,
                 result: -400,
                 message: "Registration token is mandatory.",
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
             return;
         }
 
         /* For older version, the app would still send name instead of firstName, middleName, lastName */
         if (!name) {
             logger.error("Name is mandatory.");
             const data4createResponseObject = {
                 req: req,
                 result: -400,
                 message: "Name is mandatory.",
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
             return;
         }
 
         let registrationEntry;
         try {
             registrationEntry = await global.models.GLOBAL.CODE_REGISTRATION.findOne({ phone: phone, code: token });
         } catch (error) {
             logger.error("/user - Error encountered while trying to find registration token:\n" + error);
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: "Error",
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
             return;
         }
 
         if (!registrationEntry) {
             /* Registration token verification failed */
             logger.error("/user - Invalid registration token!");
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: messages.FAILED_REGISTRATION,
                 payload: {},
                 logPayload: false
             };
             res.send(utils.createResponseObject(data4createResponseObject));
             return;
         }

         let user = await global.models.GLOBAL.USER.findOne({ phone: phone });
         if (user !== null) {
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: messages.EXISTS_PHONE,
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
             return;
         }

         const data4token = {
            id: user._id,
            date: new Date(),
            environment: process.env.APP_ENVIRONMENT,
            phone: phone,
            scope: "signup",
            type: enums.USER_TYPE.USER,
          };
 
         /* Save into mongodb */
         const uid = new ObjectId();
         const userObject = {
             _id: uid,
             device: {
                 os: _.get(device, "os", ""),
                 type: _.get(device, "type", ""),
                 token: _.get(device, "token", ""),
                 version: _.get(device, "version", "")
             },
             email: email,
             location: {
                 coordinates: [
                     _.get(location, "longitude", 0),
                     _.get(location, "latitude", 0)
                 ],
                 type: "Point"
             },
             modificationDate: Date.now().toString(),
             name: name,
             phone: phone,
             registrationDate: Date.now().toString(),
             status: {
                 name:
                 enums.USER_STATUS.ACTIVE,
                 modificationDate: Date.now().toString()
             },
             token:jwt.sign(data4token, jwtOptions.secretOrKey)
         };
 
         const newUser = global.models.GLOBAL.USER(userObject);
 
         try {
             await newUser.save();
         } catch (error) {
             logger.error("/user - Error encountered while trying to add new user:\n" + error);
             const data4createResponseObject = {
                 req: req,
                 result: -1,
                 message: messages.FAILED_REGISTRATION,
                 payload: {},
                 logPayload: false
             };
             res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
             return;
         }
 
         /* Delete the registration tokens */
         await global.models.GLOBAL.CODE_REGISTRATION.deleteMany({ phone: phone });
         const data4createResponseObject = {
             req: req,
             result: 0,
             message: "New user registered successfully!",
             payload: { _id: uid, phone: phone, user: userObject },
             logPayload: false
         };
         res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
     }
 };
 