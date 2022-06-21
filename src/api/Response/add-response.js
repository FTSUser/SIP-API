const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");
const nodemailer = require("nodemailer");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    currentProfession: Joi.string().required(),
    Qsetid: Joi.string().required(),
    ListofQA: Joi.array().required(),
    isExamDone: Joi.boolean(),
    // imagePath: Joi.string().allow("")
  }),

  handler: async (req, res) => {
    const {
      email,
      name,
      phone,
      Qsetid,
      ListofQA,
      currentProfession,
      isExamDone,
    } = req.body;
    const { user } = req;
    // if (user.type !== enums.USER_TYPE.SUPERADMIN) {
    //     const data4createResponseObject = {
    //         req: req,
    //         result: -1,
    //         message: messages.NOT_AUTHORIZED,
    //         payload: {},
    //         logPayload: false
    //     };
    //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
    // }
    if (
      !email ||
      !name ||
      !phone ||
      !Qsetid ||
      !ListofQA ||
      !currentProfession
    ) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.FILL_DETAILS,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }

    try {
      const findAid = await global.models.GLOBAL.QUESTIONSET.findOne({
        _id: Qsetid,
      });
      console.log("findAid", findAid);
      const checkMenu = await global.models.GLOBAL.RESPONSE.find({
        email: email,
        phone: phone,
        Qsetid: Qsetid,
      });
      if (checkMenu.length > 0) {
        const data4createResponseObject = {
          req: req,
          result: -400,
          message: messages.ALREADY_SEND,
          payload: {},
          logPayload: false,
        };
        res
          .status(enums.HTTP_CODES.BAD_REQUEST)
          .json(utils.createResponseObject(data4createResponseObject));
        return;
      }
      let AmenintiesCreate = {
        email: email,
        name: name,
        phone: phone,
        Aid: findAid.Aid,
        currentProfession: currentProfession,
        Qsetid: Qsetid,
        ListofQA: ListofQA,
        isExamDone: isExamDone,
      };
      const newAmeninties = await global.models.GLOBAL.RESPONSE(
        AmenintiesCreate
      );
      await newAmeninties.save();
      const Propertys = await global.models.GLOBAL.RESPONSE.findOne({
        _id: newAmeninties._id,
      });
      let loq = [];
      let t = 0,
        v = 0;
      console.log("length of ListofQA", Propertys.ListofQA.length);
      for (i = 0; i < Propertys.ListofQA.length; i++) {
        let testans = [];
        for (j = 0; j < Propertys.ListofQA[i].Option.length; j++) {
          console.log("tttttt", Propertys.ListofQA[i].Option[j].istrue);
          if (Propertys.ListofQA[i].Option[j].istrue == true) {
            testans.push(Propertys.ListofQA[i].Option[j].no);
          }
        }
        // console.log("true ans",testans);
        if (
          testans.sort().join(",") ===
          Propertys.ListofQA[i].Answer.sort().join(",")
        ) {
          console.log("true vishvans", {
            ...Propertys.ListofQA[i]._doc,
            isRight: true,
          });
          v++;
          loq.push({ ...Propertys.ListofQA[i]._doc, isRight: true });
        } else {
          console.log("true vishvans", {
            ...Propertys.ListofQA[i]._doc,
            isRight: false,
          });
          loq.push({ ...Propertys.ListofQA[i]._doc, isRight: false });
        }
        t++;
      }
      let all = { ...Propertys._doc, loq };
      let percentage = v / t;
      let User = {
        email: email,
        name: name,
        phone: phone,
        Aid: findAid.Aid,
        currentProfession: currentProfession,
        Qsetid: Qsetid,
        ListofQA: loq,
        isExamDone: isExamDone,
        total: t,
        Score: v,
        percentage: percentage,
      };
      let addUser = await global.models.GLOBAL.USER(User);
      await addUser.save();
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
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "SIP Interview| OTP To Verify Your Email",
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
                                            <span align="center" style="display: block; font-size: 16px; color: #fff;">Thank you for signing up on SIP Interview®</span>
                                           
    
    
                                            </div>
                                          
                                        </td>
                                        <td></td>
                                    </tr>
        
                                    <tr>
                                        <td style="padding: 3rem 2rem 2rem 2rem;">
                                          <p align="center" style="color: #585d6a; font-size: 14px; margin: 0;">
                                           <br>
                                           Your Score is ${v} out of ${t} <br>
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
      console.log("Message sent: %s", info.messageId);
      // const datacreateResponseObject = {
      //     req: req,
      //     result: 0,
      //     message: messages.MAIL_SENT,
      //     payload: {},
      //     logPayload: false,
      // };
      // return res
      //     .status(enums.HTTP_CODES.OK)
      //     .json(utils.createResponseObject(datacreateResponseObject));
      const notification = await global.models.GLOBAL.NOTIFICATION.create({
        type: `Response added by ${name}`,
        userName: email,
        receiver: findAid.Aid,
      });
      const data4createResponseObject = {
        req: req,
        result: 0,
        message: messages.RESPONSE_ADDED,
        payload: { newAmeninties, t, v },
        logPayload: false,
      };
      return res
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
