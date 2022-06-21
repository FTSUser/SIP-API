const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation
    validation: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        subject : Joi.string().required(),
        message :Joi.string().required(),
    }),

    handler: async (req, res) => {
        const {  name, email,subject,message } = req.body;
        
        if (!name || !email || !subject || !message) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.INVALID_PARAMETERS,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }

        try {
            let data={ name:name, email:email, subject:subject, message:message};
            const saveData = await global.models.GLOBAL.CONTACTUSADMIN(data);
            saveData.save();
            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.SUCCESS,
                payload: { data },
                logPayload: false
            };
            res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
        } catch (error) {
            logger.error(`${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`);
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.GENERAL,
                payload: {},
                logPayload: false
            };
            res.status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR).json(utils.createResponseObject(data4createResponseObject));
        }
    }
};
