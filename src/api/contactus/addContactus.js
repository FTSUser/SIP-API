const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation
    validation: Joi.object({
        pid: Joi.string().required(),
        aid: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required()
        // imagePath: Joi.string().allow("")
    }),

    handler: async (req, res) => {
        const { aid, pid, name, email,phone } = req.body;
        //const { user } = req;
        // if(user.type !== enums.USER_TYPE.SUPERADMIN){
        //     const data4createResponseObject = {
        //         req: req,
        //         result: -1,
        //         message: messages.NOT_AUTHORIZED,
        //         payload: {},
        //         logPayload: false
        //     };
        //     return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
        // }
        if (!name || !email || !phone || !pid || !aid) {
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
            let data={ aid:aid, pid:pid, name:name, email:email, phone:phone};
            const saveData = await global.models.GLOBAL.CONTACTUS(data);
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
