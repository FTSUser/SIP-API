const enums = require("../../../json/enums.json");
const Joi = require("joi");
const logger = require("../../logger");
const messages = require("../../../json/messages.json");
const utils = require("../../utils");
const ObjectId = require("mongodb").ObjectId;
// add favorites 

module.exports = exports = {
    // route validation
    validation: Joi.object({
        id: Joi.string().required(),
    }),
    // route handler
    handler: async (req, res) => {
        const { id } = req.query;
        const { user } = req;
        if (!user) {
            const data4createResponseObject = {
                req: req,
                result: -1,
                message: messages.NOT_AUTHORIZED,
                payload: {},
                logPayload: false
            };
            return res.status(enums.HTTP_CODES.UNAUTHORIZED).json(utils.createResponseObject(data4createResponseObject));
        }
        try {
            // Add to favorites
            await global.models.GLOBAL.USER.findOneAndUpdate({ _id: user._id, "status.name": "active" }, { $pull: {favorites: ObjectId(id)} }, {new: true}).exec();
         
            const data4createResponseObject = {
                req: req,
                result: 0,
                message: messages.FAVORITES_REMOVED_SUCESSFULLY,
                payload: {},
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
