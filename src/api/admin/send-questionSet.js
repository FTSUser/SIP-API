const Joi = require("joi");
const enums = require("../../../json/enums.json");
const events = require("../../../json/events.json");
const messages = require("../../../json/messages.json");
const logger = require("../../logger");
const utils = require("../../utils");
const config = require("../../../config.json");
const nodemailer = require("nodemailer");

module.exports = exports = {
  validation: Joi.object({
    email: Joi.array().required(),
  }),
  handler: async (req, res) => {
    const { email, Qsetid } = req.body;
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
        .json(utils.createResponseObject(data4createResponseObject));
    }
    if (!email || !Qsetid) {
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
    let findQset = await global.models.GLOBAL.QUESTIONSET.findOne({
      _id: Qsetid,
    });
    if (!findQset) {
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.NOT_FOUND,
        payload: {},
        logPayload: false,
      };
      return res
        .status(enums.HTTP_CODES.BAD_REQUEST)
        .json(utils.createResponseObject(data4createResponseObject));
    }
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
    for (i = 0; i < email.length; i++) {
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email[i],
        subject: "SIP Interview| Exam Link",
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
                                        <a href="${req.body.link}&email=${email[i]}"> Get your QuestionSet to click below link</a>
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
      let response = {
        email: email[i],
        Qsetid: Qsetid,
      };
      let addEmail = await global.models.GLOBAL.USERQUESTIONSET(response);
      addEmail.save();
      console.log("Message sent: %s", info.messageId);
    }

    const data4createResponseObject = {
      req: req,
      result: 0,
      message: messages.MAIL_SENT,
      payload: {},
      logPayload: false,
    };
    return res
      .status(enums.HTTP_CODES.OK)
      .json(utils.createResponseObject(data4createResponseObject));
    // if (config.MONGODB.GLOBAL.USE_TEST_PIN) {
    //     // If (dummyAccount) {
    //     // code = code;
    //     console.log("CODE NEw----=======>>>>>", code);
    //     // Save the code in database
    //     entry = global.models.GLOBAL.CODE_VERIFICATION({
    //         email: email,
    //         // code: code,
    //         date: Date.now(),
    //         expirationDate: Date.now() + 300 * 1000,
    //         failedAttempts: 0,
    //     });
    // }
  },
};
