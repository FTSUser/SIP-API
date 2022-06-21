const Joi = require("joi");

const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
    // route validation
    validation: Joi.object({
      id: Joi.string().required(),
      status: Joi.string().required()
    }),
    handler: async (req, res) => {
        const { id, status } = req.body;
        const { user } = req;
        if(user.type !== enums.USER_TYPE.SUPERADMIN){
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.NOT_AUTHORIZED,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
        }
        if (!status || status === undefined) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.INVALID_PARAMETERS,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
        }
        let criteria = {};
        if(status === "active"){
          criteria["status.name"] = enums.USER_STATUS.ACTIVE
        } else if(status === "blocked"){
          criteria["status.name"] = enums.USER_STATUS.BLOCKED
        } else if(status === "disabled"){
            criteria["status.name"] = enums.USER_STATUS.DISABLED
        } else if(status === "inactive"){
            criteria["status.name"] = enums.USER_STATUS.INACTIVE
        }
        criteria["status.modificationDate"] = Date.now().toString()

        console.log("criteria", criteria);
        console.log("id", req.body)
        try {
          if(id){
            const userExist = await global.models.GLOBAL.ADMIN.findById(id);
            if(!userExist){
                const data4createResponseObject = {
                    req: req,
                    result: -1,
                    message: messages.USER_NOT_EXIST,
                    payload: {},
                    logPayload: false
                };
                return res.status(enums.HTTP_CODES.BAD_REQUEST).json(utils.createResponseObject(data4createResponseObject));
            }
            const updatedItem = await global.models.GLOBAL.ADMIN.findByIdAndUpdate(id, {$set: criteria },{new: true});
            if(!updatedItem) {
                const data4createResponseObject = {
                    req: req,
                    result: 0,
                    message: messages.ITEM_NOT_FOUND,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
            } else {
                const data4createResponseObject = {
                    req: req,
                    result: 0,
                    message: messages.ITEM_UPDATED,
                    payload: {},
                    logPayload: false
                };
                res.status(enums.HTTP_CODES.OK).json(utils.createResponseObject(data4createResponseObject));
            }
          }
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
